import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

/**
 * NextAuth User Entity
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp_ms' }),
  image: text('image'),
  passwordHash: text('password_hash'), // Salted Argon2id hash; null for OAuth-only accounts
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * NextAuth Linked OAuth Accounts (Google, GitHub)
 */
export const accounts = sqliteTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

/**
 * NextAuth Database Sessions
 */
export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

/**
 * NextAuth Verification Tokens
 */
export const verificationTokens = sqliteTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

/**
 * User Settings & Encrypted Credentials (AES-256-GCM)
 */
export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  encryptedApiKey: text('encrypted_api_key'), // AES-256-GCM ciphertext in hex
  keyIv: text('key_iv'), // 12-byte initialization vector in hex
  keyTag: text('key_tag'), // 16-byte authentication tag in hex
  keyUpdatedAt: text('key_updated_at'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Multi-Tenant Subjects / Academic Domains
 */
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#6366f1'),
  icon: text('icon').default('book'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Multi-Tenant Uploaded Materials
 */
export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(), // 'pdf' | 'image' | 'text'
  fileSize: integer('file_size').default(0),
  filePath: text('file_path'),
  extractedText: text('extracted_text').notNull(),
  tokenEstimate: integer('token_estimate').default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Multi-Tenant AI Generated Content (Summaries / Explanations)
 */
export const generatedContent = sqliteTable('generated_content', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  materialId: text('material_id')
    .notNull()
    .references(() => materials.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'summary' | 'explanation'
  topic: text('topic'),
  level: text('level').default('simple'),
  content: text('content').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Multi-Tenant Mock Exams
 */
export const exams = sqliteTable('exams', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  materialId: text('material_id')
    .notNull()
    .references(() => materials.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  totalQuestions: integer('total_questions').notNull().default(0),
  score: real('score'),
  passed: integer('passed', { mode: 'boolean' }),
  status: text('status').default('in_progress').notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Exam Questions
 */
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'mcq' | 'truefalse' | 'open' | 'fillblank'
  questionText: text('question_text').notNull(),
  options: text('options'), // JSON stringified array of strings for MCQ
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Multi-Tenant User Answers & AI Grading
 */
export const userAnswers = sqliteTable('user_answers', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  questionId: text('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  userAnswer: text('user_answer').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }),
  score: real('score').default(0), // 0 to 1
  aiFeedback: text('ai_feedback'),
  answeredAt: text('answered_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

// Infered types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type NewGeneratedContent = typeof generatedContent.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert;
