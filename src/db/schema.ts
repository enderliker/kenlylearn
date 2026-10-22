import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Academic subjects or study areas
 */
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#6366f1'),
  icon: text('icon').default('book'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Uploaded study materials (PDF, image, text)
 */
export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
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
 * AI-generated content (Summaries and Explanations)
 */
export const generatedContent = sqliteTable('generated_content', {
  id: text('id').primaryKey(),
  materialId: text('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'summary' | 'explanation'
  topic: text('topic'),
  level: text('level').default('simple'), // 'simple' | 'medium' | 'detailed'
  content: text('content').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Mock exams
 */
export const exams = sqliteTable('exams', {
  id: text('id').primaryKey(),
  materialId: text('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  totalQuestions: integer('total_questions').notNull().default(0),
  score: real('score'), // final percentage 0-100
  passed: integer('passed', { mode: 'boolean' }),
  status: text('status').default('in_progress').notNull(), // 'in_progress' | 'completed'
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * Exam questions
 * Supported types:
 * - 'mcq': Multiple Choice Question (options in JSON string array)
 * - 'truefalse': True / False statement
 * - 'open': Open-ended response evaluated by AI
 * - 'fillblank': Fill-in-the-blank question
 */
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'mcq' | 'truefalse' | 'open' | 'fillblank'
  questionText: text('question_text').notNull(),
  options: text('options'), // JSON stringified array of options for MCQ
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation').notNull(), // pedagogical reason why this is correct
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

/**
 * User answers and AI assessment feedback
 */
export const userAnswers = sqliteTable('user_answers', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  userAnswer: text('user_answer').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }),
  score: real('score').default(0), // 0 to 1 (1 = correct, 0.5 = partial, 0 = incorrect)
  aiFeedback: text('ai_feedback'), // detailed constructive feedback from LLM
  answeredAt: text('answered_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

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
