# Implementation Plan: StudyAI — Multi-Tenant Knowledge Retention Platform

## Overview

StudyAI is transitioning from a local personal experiment into a **production-ready, public multi-tenant SaaS application** designed for deployment on **Vercel**. Students and researchers authenticate via OAuth (GitHub, Google) or traditional credentials (Email + Password with **Argon2id** hashing). 

Each user configures their own personal **NVIDIA NIM API Key** via a secure settings dashboard. The key is encrypted at rest using **AES-256-GCM**. The backend decrypts the user's key strictly in-memory during inference requests to `nvidia/nemotron-3-ultra-550b-a55b` (MoE architecture, up to 1M context tokens), generating executive study summaries, multi-tier conceptual explanations, and active-recall mock examinations.

---

## Security Architecture & Threat Model

User security, credential integrity, and multi-tenant isolation are the paramount requirements of this platform:

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Edge / TLS                    │
└──────────────────────────┬─────────────────────────────┘
                           │
             [HTTPS / CSRF Protection]
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             NextAuth.js v5 Authentication              │
│  - Google OAuth 2.0 (State Verification)               │
│  - GitHub OAuth (State Verification)                   │
│  - Email + Password (Salted Argon2id Hashing)          │
│  - Encrypted, HttpOnly, Secure Session Cookies         │
└──────────────────────────┬─────────────────────────────┘
                           │
             [Tenant Context: session.user.id]
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Data Access & Isolation Layer              │
│  - Strict IDOR Prevention: WHERE user_id = :userId     │
│  - API Keys Encrypted at Rest: AES-256-GCM             │
│    (Secret Key + Unique IV + Auth Tag per user)        │
│  - Zero Logging of Decrypted Secrets or Auth Headers   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            Database Layer (Drizzle + LibSQL)           │
│  - Multi-tenant relational schema                      │
│  - Users, Accounts, Sessions, Materials, Exams         │
└────────────────────────────────────────────────────────┘
```

### Security Guardrails:
1. **Password Storage (Argon2id)**:
   - Plaintext passwords are never persisted under any condition.
   - Hashing is performed using `Argon2id` with OWASP-recommended parameters (minimum 64 MiB memory cost, 3 iterations, 1 parallelism).
2. **API Key Encryption at Rest (AES-256-GCM)**:
   - NVIDIA API keys are encrypted before insertion into the database.
   - Storage fields: `encrypted_api_key` (hex/base64), `key_iv` (12 bytes), and `key_tag` (16 bytes authentication tag).
   - Master encryption key derived from environment variable `ENCRYPTION_SECRET` (256-bit).
   - Keys are decrypted only within the execution scope of an inference call and never sent to the browser or written to logs.
3. **Multi-Tenant Data Isolation (Anti-IDOR)**:
   - All relational entities (`materials`, `exams`, `questions`, `user_answers`, `subjects`, `generated_content`) enforce a non-nullable foreign key referencing `users.id`.
   - Every read and mutation query strictly validates ownership against `session.user.id`.
4. **Vercel Serverless Compatibility**:
   - The application runs on serverless, stateless Node.js runtimes.
   - Local SQLite file access (`better-sqlite3`) is replaced with **LibSQL / Turso** (`@libsql/client`) or serverless connection pooling, enabling seamless SQLite schema compatibility locally and over HTTP/WSS on Vercel.

---

## Architectural Decisions

| Decision | Selection | Rationale |
|---|---|---|
| **Hosting Platform** | Vercel | Global edge routing, automated CI/CD, Next.js 14 App Router native integration |
| **Authentication** | NextAuth.js (Auth.js v5) | Standard for Next.js 14, supports Google, GitHub, and Credentials providers with Drizzle adapter |
| **Password Hashing** | Argon2id (`@node-rs/argon2`) | State-of-the-art password hashing algorithm resistant to GPU cracking and side-channel attacks |
| **Credential Encryption** | `node:crypto` AES-256-GCM | Authenticated symmetric encryption preventing ciphertext tampering and credential theft |
| **Database** | LibSQL (`@libsql/client`) + Drizzle ORM | Maintains SQLite syntax and local development speed, while scaling to serverless edge DBs (Turso) for Vercel |
| **Inference Model** | NVIDIA Nemotron-3 Ultra 550B | Mixture of Experts architecture, 1M context tokens, reasoning mode |
| **Per-User Rate Limiting** | Sliding Window Token Bucket | Enforces NVIDIA's 40 RPM limit on a per-user API key basis |
| **CI / CD Pipeline** | GitHub Actions + Vercel Integration | Automated quality gates: strict type-checking, linting, security audits, build validation, and zero-downtime deployment |

---

## CI / CD & Deployment Architecture

```
[Developer / Agent Push]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│              GitHub Actions Automated CI               │
│  ├── Quality Gate: TypeScript Strict (`tsc --noEmit`)  │
│  ├── Code Hygiene: ESLint Next.js Recommended Rules    │
│  ├── Security Scan: Gitleaks Secret Detection          │
│  ├── Dependency Audit: npm audit for known CVEs        │
│  └── Build Gate: Next.js Production Build Validation   │
└──────────────────────────┬─────────────────────────────┘
                           │ (All Checks Green)
                           ▼
┌────────────────────────────────────────────────────────┐
│           Vercel Automated CD Deployment               │
│  ├── Preview Deployment (Feature Branches / PRs)       │
│  └── Production Deployment (Main Branch)               │
└────────────────────────────────────────────────────────┘
```

---

## Phase Roadmap

### Phase 1: Foundation & Dark UI Shell ✅ (Completed)
- Scaffold Next.js 14 App Router, TypeScript (Strict), Tailwind CSS.
- Dark-mode minimalist UI layout (Sidebar, Header, Dashboard, Subjects, Upload, Exams).
- Base schema and client modules in English.

### Phase 1.5: Multi-Tenant Security & Authentication Layer (Next Target)
- **Task 1.5.1**: Multi-tenant database schema upgrade (Users, Accounts, Sessions, User Settings with encrypted credentials, `user_id` foreign keys on all data tables).
- **Task 1.5.2**: AES-256-GCM Encryption / Decryption utility service.
- **Task 1.5.3**: NextAuth.js v5 setup (Google OAuth, GitHub OAuth, and Credentials with Argon2id).
- **Task 1.5.4**: Authentication UI (Login, Register, Error states, Session indicators in Header/Sidebar).
- **Task 1.5.5**: User Settings & API Key Management UI (Save, mask, validate, and test NVIDIA API key).
- **Task 1.5.6**: Automated CI/CD Pipeline (GitHub Actions quality gates, security audits, Vercel build verification).

### Phase 2: Multi-Modal Ingestion Pipeline (ON HOLD — Awaiting explicit user instruction)
- Serverless-compatible PDF text extraction (`pdf-parse`).
- Client/Serverless OCR processing (`tesseract.js`).
- Upload route handlers with user-scoped storage and validation.

### Phase 3: AI Synthesis Engine (Resumés & Deep Explanations)
- NVIDIA NIM connector with user-decrypted API keys.
- Streaming responses (SSE) for structured summaries and 3-tier explanations.
- Rate-limiting guardrail per user.

### Phase 4: Multi-Format Mock Examinations
- Exam generation (MCQ, True/False, Open-ended, Fill-in-the-blank).
- Active-recall assessment runner with immediate pedagogical feedback.
- AI evaluation of open-ended answers with scoring and reasoning traces.

### Phase 5: Longitudinal Progress Dashboard
- Aggregate retention metrics, completed exams, subject mastery percentages.
- Weak topic discovery and automated recommendation triggers.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| User NVIDIA API key leak | Critical | AES-256-GCM authenticated encryption at rest; keys never returned to client after submission; masked display (`nvapi-****...****`). |
| Insecure Direct Object Reference (IDOR) | Critical | Strict relational constraints (`user_id` on all entities) and server-side session checks on every database access. |
| Vercel Serverless filesystem limits | High | In-memory stream processing for document extraction; transition database access from local file to LibSQL/Turso over HTTP. |
| Password cracking / dictionary attacks | High | Argon2id with memory-hard parameters; rate-limiting login attempts by IP and account. |
| Ingestion file size overloads lambda memory | Medium | Enforce strict 10MB payload limit on uploads; validate MIME types before processing. |
