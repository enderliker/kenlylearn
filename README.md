# StudyAI

> High-throughput personal knowledge ingestion, synthesis, and active-recall engine powered by NVIDIA Nemotron-3 Ultra 550B MoE.

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Nemotron--3%20Ultra-76B900?style=flat-square&logo=nvidia)](https://build.nvidia.com/)
[![CI / CD](https://github.com/enderliker/study-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/enderliker/study-ai/actions/workflows/ci.yml)

---

## Overview

**StudyAI** is a local-first, distraction-free study platform designed for high-density learning and mastery. Rather than acting as a generic conversational chatbot, it operates as a structured knowledge pipeline: ingest raw academic materials (textbooks, lecture slides, research papers, diagrams, notes), parse and structure the information, and leverage NVIDIA's flagship **Nemotron-3 Ultra 550B** reasoning model to generate structured executive summaries, adaptive multi-tiered explanations, and comprehensive self-evaluating mock exams.

All data, generated artifacts, exam attempts, and evaluations are persisted locally in SQLite, establishing a longitudinal personal knowledge base with zero external data leakage.

---

## Key Capabilities

### 1. Multi-Modal Ingestion Pipeline
- **Document Parsing**: Extracts clean structured text from complex academic PDFs.
- **OCR Engine**: Processes handwritten whiteboard captures, slides, and scanned diagrams via Tesseract OCR.
- **Local Storage**: Stores original files and extracted token representations safely on disk with database indexing.

### 2. Multi-Tier Pedagogical Synthesis
- **Structured Executive Summaries**: Distills dense chapters into clear core principles, definitions, and high-retention takeaways.
- **Adaptive Explanations (Feynman Technique)**:
  - `Simple`: High intuition, relatable real-world analogies, zero jargon.
  - `Medium`: Balanced undergraduate-level depth with precise terminology.
  - `Detailed`: Rigorous mathematical/conceptual breakdown, edge cases, and mechanics.

### 3. Active-Recall Mock Examinations
- **Multiple Choice (MCQ)**: 4 distinct choices testing precision and differentiating subtle distinctions.
- **True / False**: Fast-paced conceptual sanity checks.
- **Fill-in-the-Blank**: Tests active recall of technical nomenclature, formulas, and exact terms.
- **Open-Ended Synthesis**: Free-form student answers evaluated by Nemotron's reasoning engine, scoring understanding from 0.0 to 1.0 with constructive feedback.

### 4. Built-in Production Guardrails
- **Preemptive Rate-Limiting**: Integrated sliding-window limiter enforcing safe operation under NVIDIA NIM's 40 requests/minute (RPM) threshold.
- **Long-Context Support**: Optimized to take full advantage of Nemotron-3's 1M token context capacity.
- **Dark Minimalist Interface**: Pure functional aesthetic built for extended focus sessions without eye strain or visual distractions.

---

## Architecture

```
[Raw Materials: PDF / Images / Text]
                │
                ▼
  [Text Extraction / OCR Pipeline]
                │
                ▼
    [Local SQLite (WAL Mode)]
                │
     ┌──────────┴──────────┐
     ▼                     ▼
[AI Engine (NIM)]    [Web Interface]
  - Nemotron-3 550B    - Dashboard
  - Rate Limiter Guard - Subjects
  - Streaming SSE      - Material Viewer
  - Evaluator Mode     - Exam Runner
```

---

## Tech Stack

| Domain | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Single cohesive codebase for SSR UI and API routes |
| **Language** | TypeScript 5.5 (Strict) | End-to-end type safety from database to UI components |
| **Styling** | Tailwind CSS | Minimalist dark palette (`#09090b`), zero external bloat |
| **Database** | SQLite + Drizzle ORM | Embedded, zero infrastructure overhead, WAL-enabled concurrency |
| **Inference Engine** | NVIDIA NIM API | Nemotron-3 Ultra 550B MoE via OpenAI-compatible endpoints |
| **Document Processing** | `pdf-parse` + `tesseract.js` | Local server-side PDF and image OCR text extraction |

---

## Project Structure

```
study-ai/
├── src/
│   ├── app/                      # Next.js App Router pages and layouts
│   │   ├── exams/                # Mock exam runner and results
│   │   ├── subjects/             # Academic subject management
│   │   ├── upload/               # Multi-modal material upload
│   │   ├── globals.css           # Minimal dark design system tokens
│   │   ├── layout.tsx            # Root shell with persistent navigation
│   │   └── page.tsx              # Central study dashboard
│   ├── components/
│   │   ├── layout/               # Header, Sidebar, and navigation components
│   │   └── ui/                   # Minimalist design primitives (Button, Card, Badge)
│   ├── db/
│   │   ├── index.ts              # SQLite connection pool and WAL configuration
│   │   ├── schema.ts             # Drizzle ORM table schemas & relational types
│   │   └── seed.ts               # Initial dataset seed script
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts         # NVIDIA NIM client (completions + streaming)
│   │   │   ├── prompts.ts        # Prompt engineering & strict JSON schemas
│   │   │   └── rate-limiter.ts   # 40 RPM sliding-window concurrency guard
│   │   └── utils.ts              # Utility helpers
│   └── types/                    # Shared domain models and TypeScript contracts
├── tasks/
│   ├── plan.md                   # Complete architectural specification & phase roadmap
│   └── todo.md                   # Verifiable implementation checklist
├── drizzle.config.ts             # Drizzle ORM database migration configuration
├── tailwind.config.ts            # Tailwind styling tokens
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## Getting Started

### Prerequisites
- Node.js `>= 18.18.0` (Node.js 22 LTS recommended)
- `pnpm` or `npm`
- An NVIDIA API Key from [build.nvidia.com](https://build.nvidia.com) (free tier includes initial credits)

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/enderliker/study-ai.git
   cd study-ai
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Add your NVIDIA API key inside `.env.local`:
   ```ini
   NVIDIA_API_KEY="nvapi-your-key-here"
   NVIDIA_BASE_URL="https://integrate.api.nvidia.com/v1"
   NVIDIA_MODEL="nvidia/nemotron-3-ultra-550b-a55b"
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

4. **Initialize Database Schema:**
   ```bash
   pnpm db:push
   ```

5. **Start Development Server:**
   ```bash
   pnpm dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Security & Privacy

- **Zero Telemetry**: All database operations and document storage occur strictly on the local filesystem.
- **Direct API Communication**: Prompts and context are sent directly to NVIDIA's secure endpoints with no intermediate third-party brokers.
- **Sensitive File Exclusion**: Environment credentials (`.env*`) and generated database files (`*.db`) are strictly excluded by `.gitignore`.

---

## License

MIT License. Designed and maintained for private, focused technical study.
