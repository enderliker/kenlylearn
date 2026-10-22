# AGENTS.md — Autonomous Agent Operating Guidelines

This repository (`study-ai`) is a high-performance, local-first academic study platform. Autonomous AI agents modifying or extending this codebase must strictly adhere to the standards and operational boundaries documented below.

---

## 1. Core Engineering Principles

1. **Simplicity Over Abstraction**: Never introduce unnecessary design patterns, micro-packages, or speculative abstractions. Prefer direct, readable, and auditable code.
2. **Language Consistency**: All code, symbol names, types, database entities, error messages, and internal documentation MUST be in **English**.
3. **Design Language**: Strictly dark mode only (`#09090b` zinc base). No gradients, saturated animations, or playful/educational themes. Clean, high-density, serious academic aesthetic.
4. **Local-First & Privacy**: All student data, raw materials, embeddings, and exam results belong in the local SQLite database (`study-ai.db`). Never introduce external logging, telemetry, or remote storage dependencies.
5. **No Blind Overwriting**: Always inspect `tasks/plan.md` and `tasks/todo.md` before starting work. Keep the task checklist updated.

---

## 2. Technology Stack & Architectural Boundaries

- **Framework**: Next.js 14 (App Router) with TypeScript (Strict).
- **Styling**: Tailwind CSS with custom CSS variables defined in `src/app/globals.css`.
- **Database**: SQLite accessed via `better-sqlite3` and `drizzle-orm`. Migrations managed via `drizzle-kit`.
- **Inference**: NVIDIA NIM OpenAI-compatible API (`https://integrate.api.nvidia.com/v1`).
- **Target Model**: `nvidia/nemotron-3-ultra-550b-a55b` (MoE architecture, up to 1M context tokens).
- **Document Processing**: `pdf-parse` for PDFs and `tesseract.js` for OCR.

---

## 3. Rate-Limiting & API Rules

- **Hard Limit**: NVIDIA free tier enforces a **40 requests per minute (RPM)** rate limit.
- **Rule**: Every outgoing request to NVIDIA NIM MUST pass through `rateLimiter.throttle()` located in `src/lib/ai/rate-limiter.ts`. Never bypass the limiter.
- **Thinking / Reasoning**: For structured extractions and exams, enable reasoning mode (`enable_thinking: true`) only when evaluating free-form student responses or generating multi-step exam questions.

---

## 4. Database & Schema Rules

- All table definitions live in `src/db/schema.ts`.
- Primary keys must use UUID strings: `text('id').primaryKey()`.
- Timestamps must default to `sql`(CURRENT_TIMESTAMP)``.
- Foreign keys must declare explicit cascade rules: `.references(() => parent.id, { onDelete: 'cascade' })`.
- Never mutate the SQLite file directly during code changes; use Drizzle schema and `pnpm db:push`.

---

## 5. Coding Standards

- **TypeScript**: No `any`. Use strict interfaces exported from `src/types/index.ts` or inferred Drizzle types (`typeof table.$inferSelect`).
- **Components**: Functional components only. Client components must declare `'use client'` as their first line.
- **Server Actions / Route Handlers**: Validate all incoming payloads before processing. Return standard JSON error responses `{ error: string }` with appropriate HTTP status codes.
- **Formatting**: 2-space indentation, single quotes for strings, semicolons required.

---

## 6. Verification Checklist Before Committing

Before completing any task or opening a pull request, ensure:
- [ ] No compilation or TypeScript errors.
- [ ] No leftover `console.log` debugging statements.
- [ ] No secrets or API keys committed (verify `.env*` is gitignored).
- [ ] Tasks in `tasks/todo.md` are checked off accurately.
- [ ] Verified that changes adhere to the minimalist dark design language.
