# KenlyLearn — Implementation Task List

> Detailed task breakdown and verification checklist. All tasks follow strict acceptance criteria and the multi-tenant security architecture.

---

## Phase 1: Foundation & Dark UI Shell ✅

### Task 1: Scaffold Next.js project with baseline dependencies
**Description:** Configure Next.js 14 App Router, TypeScript, Tailwind CSS, project layout, environment variables, and initial directory structure.
- [x] Next.js 14 with App Router and TypeScript initialized
- [x] Tailwind CSS configured with dark-mode only theme (`#09090b` zinc base)
- [x] Package dependencies and scripts configured
- [x] `.env.local.example` created
- [x] Core folder hierarchy established (`src/app/`, `src/lib/`, `src/components/`, `src/db/`, `src/types/`)
- [x] UI primitives implemented (`Button`, `Card`, `Badge`)

### Task 2: Baseline Database Schema & Drizzle Setup
**Description:** Initial schema definition for subjects, materials, generated content, exams, questions, and user answers with Drizzle ORM.
- [x] Schema defined in `src/db/schema.ts`
- [x] SQLite database connection singleton with WAL mode
- [x] Drizzle config defined in `drizzle.config.ts`
- [x] Seed script created in `src/db/seed.ts`

### Task 3: Primary Layout & Navigation Shell
**Description:** Sidebar navigation, persistent header, and initial route views in English.
- [x] Sidebar navigation with active state styling and model status indicator
- [x] Header with route breadcrumbs and sync indicator
- [x] Minimalist dark theme without gradients
- [x] Route stub views created: `/`, `/subjects`, `/upload`, `/exams`
- [x] 100% English codebase and symbol naming

---

## Phase 1.5: Multi-Tenant Security & Authentication Layer

### Task 1.5.1: Multi-Tenant Database Schema with User Scoping
**Description:** Update `src/db/schema.ts` to support NextAuth.js v5 (users, accounts, sessions, verification tokens) and add non-nullable `userId` foreign keys with cascade deletion to all data tables (`materials`, `exams`, `questions`, `user_answers`, `subjects`, `generated_content`). Add user settings table for encrypted API credentials.

**Acceptance criteria:**
- [x] NextAuth tables added: `users`, `accounts`, `sessions`, `verificationTokens`
- [x] User password hash column: `passwordHash` on `users` table (nullable for OAuth-only users)
- [x] Table `user_settings`: `userId` (PK, references `users.id`), `encryptedApiKey` (text), `keyIv` (text), `keyTag` (text), `keyUpdatedAt`
- [x] Non-nullable `userId` column added to `subjects`, `materials`, `exams`, `user_answers`, `generated_content`
- [x] Seed script updated with multi-tenant relational integrity

**Verification:**
- [x] Schema compiles without TypeScript errors (`tsc --noEmit`)
- [x] Drizzle schema types infer cleanly for both insert and select models

**Dependencies:** Tasks 1-3

**Files likely touched:**
- `src/db/schema.ts`
- `src/db/seed.ts`
- `package.json`

**Estimated scope:** Medium (3 files)

---

### Task 1.5.2: Cryptographic Encryption Service (AES-256-GCM)
**Description:** Implement `src/lib/crypto/encryption.ts` using Node.js `node:crypto` to provide authenticated AES-256-GCM encryption and decryption for user-supplied NVIDIA API keys, and Argon2id password hashing in `src/lib/crypto/password.ts`.

**Acceptance criteria:**
- [x] Function `encryptSecret(plaintext: string): { ciphertext: string; iv: string; tag: string }`
- [x] Function `decryptSecret(ciphertext: string, iv: string, tag: string): string`
- [x] Master key derived via SHA-256 from `ENCRYPTION_SECRET`
- [x] Authenticated encryption prevents tampering; invalid auth tags throw explicit errors
- [x] Zero secret logging: errors never output ciphertext or decrypted contents
- [x] Argon2id password hashing and constant-time verification implemented

**Verification:**
- [x] Unit test: encrypt string -> decrypt string -> verify equality
- [x] Unit test: tampered tag or ciphertext fails decryption cleanly
- [x] Masking utility: `maskApiKey(key: string): string` produces `nvapi-****...****`
- [x] All 5 tests pass in test suite (`pnpm test`)

**Dependencies:** None

**Files likely touched:**
- `src/lib/crypto/encryption.ts`
- `src/lib/crypto/password.ts`
- `tests/encryption.test.mjs`

**Estimated scope:** Small (2-3 files)

---

### Task 1.5.3: Authentication System (NextAuth.js v5 + Google + GitHub + Argon2id)
**Description:** Configure NextAuth.js v5 with Google OAuth, GitHub OAuth, and Credentials provider using Argon2id password verification. Implement session callbacks and middleware protecting authenticated routes.

**Acceptance criteria:**
- [ ] `auth.ts` / NextAuth v5 configured with Drizzle adapter
- [ ] Google OAuth provider configured
- [ ] GitHub OAuth provider configured
- [ ] Credentials provider: validates email + password using `argon2.verify(user.passwordHash, password)`
- [ ] Registration API route (`POST /api/auth/register`): hashes password with Argon2id and creates user
- [ ] Session callback injects `user.id` into session object
- [ ] Middleware protecting `/upload`, `/exams`, `/settings`, and API routes from unauthenticated access

**Verification:**
- [ ] Register user with email/password succeeds and stores Argon2id hash
- [ ] Login with valid credentials succeeds; invalid password returns 401
- [ ] Unauthenticated requests to protected routes redirect to `/login`

**Dependencies:** Tasks 1.5.1, 1.5.2

**Files likely touched:**
- `src/auth.ts`
- `src/middleware.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/lib/crypto/password.ts`

**Estimated scope:** Medium (4-5 files)

---

### Task 1.5.4: Authentication UI (Sign in, Sign up, Session state)
**Description:** Create sleek, dark minimalist authentication interfaces for login and registration, supporting OAuth one-click buttons (Google, GitHub) and email/password fields with validation.

**Acceptance criteria:**
- [ ] Sign in page (`/login`) with Google, GitHub, and email/password options
- [ ] Sign up page (`/register`) with name, email, password confirmation, and password strength guidance
- [ ] Loading states, disabled buttons during submission, and clear error notifications
- [ ] Header/Sidebar updated with user avatar, name, and Sign Out button
- [ ] Clean dark aesthetic matching the system tokens (`#09090b` zinc)

**Verification:**
- [ ] User can sign up, log in, view their profile name in header, and log out cleanly
- [ ] Responsive layout across mobile and desktop viewports

**Dependencies:** Task 1.5.3

**Files likely touched:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/sidebar.tsx`

**Estimated scope:** Medium (5 files)

---

### Task 1.5.5: User Settings & Encrypted NVIDIA API Key Management
**Description:** Build the settings interface allowing each user to provide, update, validate, and delete their personal NVIDIA NIM API Key. Store keys securely using AES-256-GCM.

**Acceptance criteria:**
- [ ] Route `/settings`: Section for "NVIDIA API Configuration"
- [ ] Form to input API key (password-masked field with show/hide toggle)
- [ ] API endpoint `POST /api/settings/api-key`: encrypts key with AES-256-GCM and updates `user_settings`
- [ ] API endpoint `GET /api/settings/api-key`: returns masked key status (never plaintext key)
- [ ] "Test Connection" button: validates key against NVIDIA NIM `/v1/models` endpoint
- [ ] In-memory decryption utility: `getUserApiKey(userId: string): Promise<string>`

**Verification:**
- [ ] User inputs key -> saved encrypted in DB -> UI displays masked `nvapi-****...****`
- [ ] Database inspection proves key is stored encrypted with IV and tag
- [ ] Test connection verifies key validity with NVIDIA API

**Dependencies:** Tasks 1.5.1, 1.5.2, 1.5.3

**Files likely touched:**
- `src/app/settings/page.tsx`
- `src/components/settings/api-key-form.tsx`
- `src/app/api/settings/api-key/route.ts`
- `src/app/api/settings/api-key/test/route.ts`
- `src/lib/ai/user-key.ts`

**Estimated scope:** Medium (5 files)

---

### Task 1.5.6: Automated CI/CD Pipeline & Quality Gates
**Description:** Configure GitHub Actions workflow (`.github/workflows/ci.yml`) to enforce automated quality gates on every push and pull request targeting `main`. Includes static typecheck, ESLint, Gitleaks secret scanning, dependency CVE audits, and Next.js production build verification before Vercel deployment.

**Acceptance criteria:**
- [x] Workflow `.github/workflows/ci.yml` created and configured
- [x] Concurrency control configured to cancel stale runs on new pushes
- [x] Job 1: TypeScript static typecheck (`tsc --noEmit`) and ESLint validation
- [x] Job 2: Secret leak detection (Gitleaks) and dependency vulnerability audit (`npm audit`)
- [x] Job 3: Next.js production build verification with simulated environment variables
- [x] Job 4: Vercel deployment validation gate

**Verification:**
- [x] GitHub Actions workflow triggers on push to `main`
- [x] All pipeline stages pass cleanly in GitHub Actions UI

**Dependencies:** Tasks 1-3

**Files likely touched:**
- `.github/workflows/ci.yml`
- `tasks/plan.md`
- `tasks/todo.md`

**Estimated scope:** Small (1-2 files)

---

## ⏸️ Phase 2: Multi-Modal Ingestion Pipeline (ON HOLD)

> [!IMPORTANT]
> **STATUS: ON HOLD**. Implementation will strictly not begin until explicit confirmation from the user.

### Task 4: Serverless Document Extraction Pipeline (PDF + OCR + Plaintext)
- [ ] Serverless-compatible PDF parser (`pdf-parse`)
- [ ] Client/Serverless Tesseract OCR worker
- [ ] File chunking & token budgeting for 1M context

### Task 5: User-Scoped Ingestion API & Cloud/Serverless Storage
- [ ] `POST /api/materials/upload` with user session validation
- [ ] Strict file validation (max 10MB, allowed MIME types)
- [ ] Multi-tenant isolation: every record stamped with `session.user.id`

### Task 6: Upload UI with Drag & Drop and Preview
- [ ] Drag-and-drop dropzone with progress bar
- [ ] Extracted text preview with manual correction mode

---

## Phase 3: AI Synthesis Engine (Resumés & Deep Explanations)

### Task 7: AI Service Integration with User Encrypted Keys
- [ ] Retrieve and decrypt user's NVIDIA API key per request
- [ ] Preemptive rate limiter (40 RPM guard per user)
- [ ] Streaming SSE responses

### Task 8: Structured Study Summaries API & UI
- [ ] Markdown executive summary generation
- [ ] Persistent storage in `generated_content` scoped to `user_id`

### Task 9: Adaptive Feynman Concept Explanations
- [ ] 3-tier difficulty levels (Simple, Medium, Detailed)
- [ ] Real-world analogy generation and conceptual breakdown

---

## Phase 4: Multi-Format Mock Examinations

### Task 10: Multi-Format Exam Generation API
- [ ] Structured JSON generation: MCQ, True/False, Open-ended, Fill-in-the-blank
- [ ] Strict schema validation with Zod

### Task 11: Interactive Exam Runner (MCQ & True/False)
- [ ] Active recall interface with immediate pedagogical feedback

### Task 12: Interactive Exam Runner (Open Synthesis & Fill-in-the-Blank)
- [ ] Free-form response input and inline blanks

### Task 13: AI Reasoning Evaluation & Scoring
- [ ] Nemotron-3 reasoning mode grading for open answers (0.0 to 1.0)
- [ ] Constructive feedback and knowledge gap identification

---

## Phase 5: User Dashboard & Longitudinal Retention Tracking

### Task 14: Multi-Tenant Progress & Analytics Engine
- [ ] User-scoped metrics: exams taken, average score, weak topic detection

### Task 15: Central Study Dashboard
- [ ] High-density analytics cards, recent exams list, quick action triggers
