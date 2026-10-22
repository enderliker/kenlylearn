-- ==============================================================================
-- KENLYLEARN — SUPABASE POSTGRESQL PRODUCTION SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- All tables enforce strict multi-tenant isolation, anti-IDOR protections,
-- and explicit access policies.

-- 1. Create Private Schema (Unexposed from PostgREST API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT ALL ON SCHEMA private TO service_role;

-- 2. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- NextAuth / Supabase User Identity
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified TIMESTAMPTZ,
  image TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- NextAuth OAuth Accounts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

-- ------------------------------------------------------------------------------
-- NextAuth Sessions & Verification Tokens
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  session_token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ------------------------------------------------------------------------------
-- User Settings & Encrypted NVIDIA API Keys (AES-256-GCM)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  encrypted_api_key TEXT,
  key_iv TEXT,
  key_tag TEXT,
  key_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- Academic Subjects / Domains
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- Uploaded Study Materials (PDF, Markdown, OCR Text)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_path TEXT,
  extracted_text TEXT NOT NULL,
  token_estimate INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- AI Generated Content (Summaries & Feynman Breakdowns)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_content (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  topic TEXT,
  level TEXT DEFAULT 'simple',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- Mock Exams & Practice Assessments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  total_questions INTEGER DEFAULT 0 NOT NULL,
  score REAL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- Exam Questions (MCQ, True/False, Open-ended, Fill-in-the-blank)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- User Answers & Active Recall Submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_answers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct INTEGER,
  score REAL,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- MANDATORY REQUIREMENT 1: ENABLE ROW LEVEL SECURITY (RLS) ON EVERY TABLE
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (prevents accidental superuser bypass)
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subjects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.materials FORCE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content FORCE ROW LEVEL SECURITY;
ALTER TABLE public.exams FORCE ROW LEVEL SECURITY;
ALTER TABLE public.questions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES (MULTI-TENANT ISOLATION VIA auth.uid())
-- ==============================================================================

-- 1. Users table policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid()::TEXT = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid()::TEXT = id)
  WITH CHECK (auth.uid()::TEXT = id);

-- 2. User Settings (Encrypted API Keys)
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

-- 3. Subjects
DROP POLICY IF EXISTS "Users can manage own subjects" ON public.subjects;
CREATE POLICY "Users can manage own subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

-- 4. Materials
DROP POLICY IF EXISTS "Users can manage own materials" ON public.materials;
CREATE POLICY "Users can manage own materials" ON public.materials
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

-- 5. Generated Content
DROP POLICY IF EXISTS "Users can manage own generated content" ON public.generated_content;
CREATE POLICY "Users can manage own generated content" ON public.generated_content
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

-- 6. Exams
DROP POLICY IF EXISTS "Users can manage own exams" ON public.exams;
CREATE POLICY "Users can manage own exams" ON public.exams
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

-- 7. Questions
DROP POLICY IF EXISTS "Users can manage own questions" ON public.questions;
CREATE POLICY "Users can manage own questions" ON public.questions
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

-- 8. User Answers
DROP POLICY IF EXISTS "Users can manage own answers" ON public.user_answers;
CREATE POLICY "Users can manage own answers" ON public.user_answers
  FOR ALL TO authenticated
  USING (auth.uid()::TEXT = user_id)
  WITH CHECK (auth.uid()::TEXT = user_id);

-- ==============================================================================
-- PERFORMANCE INDEXES (Optimized for Multi-Tenant Lookups)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_materials_user ON public.materials (user_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON public.materials (subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects (user_id);
CREATE INDEX IF NOT EXISTS idx_exams_user ON public.exams (user_id);
CREATE INDEX IF NOT EXISTS idx_exams_material ON public.exams (material_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON public.questions (exam_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON public.user_answers (question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user ON public.user_answers (user_id);
