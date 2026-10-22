import { Material, Subject, Exam, Question, UserAnswer, GeneratedContent } from '@/db/schema';

export type FileType = 'pdf' | 'image' | 'text';

export type QuestionType = 'mcq' | 'truefalse' | 'open' | 'fillblank';

export type ExplanationLevel = 'simple' | 'medium' | 'detailed';

export interface MCQOptions {
  options: string[]; // 4 choices (A, B, C, D)
}

export interface QuestionWithOptions extends Omit<Question, 'options'> {
  options?: string[] | null;
}

export interface ExamWithQuestions extends Exam {
  questions: QuestionWithOptions[];
}

export interface MaterialWithDetails extends Material {
  subject?: Subject | null;
  summaries?: GeneratedContent[];
  explanations?: GeneratedContent[];
  exams?: Exam[];
}

export interface ExamEvaluationResult {
  questionId: string;
  isCorrect: boolean;
  score: number; // 0 to 1
  aiFeedback: string;
}

export interface OverallStats {
  totalSubjects: number;
  totalMaterials: number;
  totalExams: number;
  completedExams: number;
  averageScore: number;
  strongAreas: string[];
  weakAreas: string[];
}
