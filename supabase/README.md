# Supabase Hardened Security & Deployment Guide — KenlyLearn

This document details the configuration and architecture required to operate **Supabase PostgreSQL** as the production database backend for KenlyLearn, strictly adhering to the 5 non-negotiable security directives.

---

## 1. Row Level Security (RLS) Mandate

**Every single table in KenlyLearn has RLS enabled and forced.**

In PostgreSQL/Supabase, creating a table without RLS allows anyone with your public URL and anonymous (`anon`) key to read and mutate records.

### Implementation:
Execute [`supabase/schema.sql`](./schema.sql) in your Supabase SQL Editor. It enforces:

```sql
-- Enables RLS on all entity tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Forces RLS so table owners/superusers cannot bypass policies accidentally
ALTER TABLE public.user_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.materials FORCE ROW LEVEL SECURITY;
ALTER TABLE public.exams FORCE ROW LEVEL SECURITY;
```

### Access Policies:
Every table restricts access to rows where `auth.uid() = user_id`:
```sql
CREATE POLICY "materials_isolation" ON public.materials
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);
```
Unauthenticated or mismatched cross-tenant queries return zero records and reject mutations automatically.

---

## 2. Zero `service_role` Exposure on Frontend (Client-Side)

Supabase issues two API keys:
- **`anon` (Public)**: Safe for client browsers, strictly bound by RLS policies.
- **`service_role` (Secret)**: Administrative key that **completely bypasses all RLS rules**.

### Rules Implemented in Codebase:
1. **Never prefix service key with `NEXT_PUBLIC_`**:
   - `NEXT_PUBLIC_SUPABASE_URL` ✅ (Safe)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (Safe)
   - `SUPABASE_SERVICE_ROLE_KEY` 🔒 (Server-Only, No `NEXT_PUBLIC_` prefix!)
2. **Client Module [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts)**:
   - Uses exclusively `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Never references `SUPABASE_SERVICE_ROLE_KEY`.
3. **Server Module [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts)**:
   - Contains a hard runtime check:
     ```ts
     if (typeof window !== 'undefined') {
       throw new Error('FATAL SECURITY VIOLATION: createAdminClient() cannot be called in browser context.');
     }
     ```
   - Prevents accidental bundling into client chunks.

---

## 3. Restricting PostgREST Exposed Schemas

By default, Supabase's auto-generated REST API (PostgREST) exposes the `public` schema. Internal server-only tables or staging data should never be exposed to frontend queries.

### Configuration Steps:
1. **Create the `private` schema**:
   [`supabase/schema.sql`](./schema.sql) creates the schema and revokes client access:
   ```sql
   CREATE SCHEMA IF NOT EXISTS private;
   REVOKE ALL ON SCHEMA private FROM anon, authenticated;
   GRANT ALL ON SCHEMA private TO service_role;
   ```
2. **Supabase Dashboard**:
   - Navigate to **Project Settings** > **API**.
   - Under **Exposed schemas**, verify that only `public` is selected (never add `private`).
   - Tables placed in `private` will be completely invisible to frontend PostgREST queries, accessible only by your server-side database connection.

---

## 4. Disabling Public Self-Registration (If Operating Private Workspace)

If your KenlyLearn deployment is for a private cohort, institution, or personal workspace:

### Configuration Steps:
1. Go to **Authentication** > **Providers** > **Email**.
2. Toggle off **"Allow new users to sign up"**.
   - When disabled, only authorized admins using the server-side API or dashboard can invite new users.
3. If public registration is enabled, ensure:
   - **Confirm email** is enabled to prevent fake identity registrations.
   - **Rate Limiting** is configured under **Authentication** > **Rate Limits** to prevent brute-force attacks on login endpoints.

---

## 5. Configuring Allowed Origins (Strict CORS)

By default, new projects may have CORS set to `*`, allowing malicious third-party websites to forge requests against your Supabase instance.

### Configuration Steps:
1. Navigate to **Project Settings** > **API**.
2. Under **Allowed Origins (CORS)**:
   - Remove the wildcard `*`.
   - Add only your verified domains:
     - Development: `http://localhost:3000`
     - Production: `https://kenlylearn.vercel.app` (or your custom domain `https://your-domain.com`)
3. Save changes. Any cross-origin request from an unauthorized domain will now be rejected at the gateway.

---

## Environment Variables Reference

Add the following to `.env.local` (local) and Vercel Project Settings (production):

```bash
# Supabase Public Keys (Available to Client & Server)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Secret Admin Key (STRICTLY SERVER-SIDE - NEVER EXPOSE TO CLIENT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Direct PostgreSQL Connection / Pooler URL (for Drizzle ORM migrations)
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```
