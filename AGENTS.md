# AGENTS.md — Autonomous Agent Operating Guidelines & Security Protocols

This repository (`kenlylearn`) is a production-grade, multi-tenant academic study and active-recall platform deployed to **Vercel**. Every autonomous AI agent operating on this codebase must adhere strictly to the engineering standards and non-negotiable security protocols documented below.

---

## 1. Prime Directive: Uncompromising User Security & Privacy

**User credentials, personal study materials, and API keys must be protected at all costs.** Security is not an afterthought or an optional checklist item; it dictates every architectural choice, query, and API handler.

### Core Security Mandates:
1. **Zero Plaintext Secrets**:
   - Passwords must **NEVER** be stored in plaintext. They must be salted and hashed using **Argon2id** (OWASP recommended parameters: minimum memory 64 MiB, 3 iterations, 1 parallelism thread).
   - User-supplied third-party API keys (e.g., NVIDIA NIM API keys) must be encrypted at rest using authenticated encryption: **AES-256-GCM** with unique initialization vectors (IV) and authentication tags per record.
   - Master encryption keys (`ENCRYPTION_SECRET`) must be sourced strictly from environment variables and never logged, exposed via APIs, or written to disk.
2. **Absolute Multi-Tenant Isolation (Anti-IDOR)**:
   - Every single database table storing user data (`materials`, `exams`, `questions`, `user_answers`, `generated_content`, `subjects`) **MUST** include a non-nullable `user_id` foreign key.
   - Every SQL query, mutation, select, or deletion **MUST** explicitly filter by the authenticated user's ID (`eq(table.userId, session.user.id)`).
   - Never trust client-supplied entity IDs without verifying ownership in the same transaction or query.
3. **Defense-in-Depth for Authentication & Sessions**:
   - Session cookies must strictly enforce: `HttpOnly`, `Secure` (production), `SameSite=Lax` or `Strict`, and `Path=/`.
   - OAuth providers (Google, GitHub) must implement state parameter verification to prevent CSRF.
   - Credentials login must enforce rate-limiting per IP and per account to mitigate brute-force and credential stuffing attacks.
4. **Zero-Leakage Telemetry & Logging**:
   - Never log authorization headers, passwords, hashes, session tokens, or decrypted user API keys in console logs, audit logs, or error responses.
   - API error responses to clients must return generic status messages (`{ "error": "Invalid credentials" }`) without exposing database stack traces, table names, or internal error objects.

---

## 2. Architectural Boundaries & Vercel Serverless Requirements

- **Runtime Target**: Vercel Serverless Functions (Node.js runtime).
- **Ephemeral Filesystems**: Vercel functions have read-only filesystems with an ephemeral `/tmp` directory. Never rely on permanent local disk storage (`uploads/` or local `kenlylearn.db` in production).
- **Database Architecture**: SQLite/LibSQL via Drizzle ORM (`@libsql/client` or Turso/Serverless PostgreSQL). Local development may use local LibSQL/SQLite, while production connects over HTTPS/WSS via serverless connection pooling.
- **Inference Pipeline**: NVIDIA NIM OpenAI-compatible API (`https://integrate.api.nvidia.com/v1`).
- **Target LLM**: `nvidia/nemotron-3-ultra-550b-a55b` (MoE architecture, up to 1M context tokens).
- **Rate-Limiting**: Enforce user-level sliding window rate limiting (respecting NVIDIA's 40 RPM quota per key).

---

## 3. Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript (Strict).
- **Authentication**: NextAuth.js (Auth.js v5) with Drizzle Adapter:
  - OAuth: Google OAuth 2.0 & GitHub OAuth.
  - Credentials: Email + Argon2id hashed passwords.
- **Database & ORM**: Drizzle ORM with LibSQL/SQLite schema (`src/db/schema.ts`).
- **Cryptography**: Node.js `node:crypto` (AES-256-GCM) + `@node-rs/argon2` or `argon2`.
- **Styling**: Tailwind CSS with custom CSS variables (`src/app/globals.css`).
- **Design System**: Strictly dark mode only (`#09090b` zinc base). No saturated animations, playful educational themes, or unnecessary gradients. Serious, high-density academic aesthetic.

---

## 4. Coding Standards & Conventions

1. **Language Consistency**: 100% of all code, identifiers, types, schemas, comments, commits, and documentation must be in **English**.
2. **TypeScript Integrity**: No `any`. Strict typings exported from `src/types/index.ts` or inferred from Drizzle schemas (`typeof table.$inferSelect`).
3. **Components**: Functional components only. Client components declare `'use client'` as line 1.
4. **Server Actions / Route Handlers**:
   - Always authenticate incoming requests first (`const session = await auth()`).
   - Validate and sanitize all incoming payloads with Zod before processing.
   - Check resource ownership prior to mutation or retrieval.
5. **Formatting**: 2-space indentation, single quotes for strings, semicolons required.

---

## 5. Verification Checklist Before Committing

Before closing any task or committing changes:
- [ ] No compilation or TypeScript errors (`tsc --noEmit`).
- [ ] Authentication and authorization checked on all touched routes.
- [ ] Every database query enforces tenant isolation (`userId` filter).
- [ ] No secrets, hashes, or API keys exposed in responses or console logs.
- [ ] Tasks in `tasks/todo.md` updated accurately.
- [ ] Code strictly follows English naming and minimalist dark design language.
