import { ExplanationLevel, QuestionType } from '@/types';

export const SYSTEM_PROMPTS = {
  summary: `You are an expert academic tutor and pedagogical specialist.
Your mission is to transform study materials into clear, high-retention structured summaries.
Guidelines:
1. Synthesize core concepts without losing technical precision.
2. Structure output cleanly with markdown headings, bullet points, and key takeaways.
3. Highlight critical definitions, formulas, or principles.
4. Keep the tone encouraging, clear, and focused on active understanding.`,

  explanation: (level: ExplanationLevel) => {
    switch (level) {
      case 'simple':
        return `You are a patient and clear mentor. Explain the concept using simple language, everyday real-world analogies, and zero unnecessary jargon. Think of the Feynman technique.`;
      case 'medium':
        return `You are a knowledgeable university tutor. Explain the concept balancing foundational intuition with accurate academic terminology and practical context.`;
      case 'detailed':
        return `You are a senior academic specialist. Provide an in-depth, rigorous breakdown including underlying mechanics, nuances, common misconceptions, and advanced applications.`;
    }
  },

  examGenerator: `You are an expert test creator and exam evaluator.
Your goal is to generate high-quality assessment questions directly derived from the provided study material.
You MUST output ONLY a valid JSON object matching the requested schema. No conversational filler or markdown code-fences.`,

  evaluator: `You are an impartial academic examiner.
Your job is to objectively evaluate a student's answer against the correct answer and reference material.
Assess conceptual understanding even if wording varies.
Score from 0.0 (incorrect) to 1.0 (fully correct), with 0.5 for partial understanding.
Provide concise, constructive feedback explaining what was correct and what was missing.
Output strictly as a valid JSON object.`,
};

export function buildSummaryPrompt(materialTitle: string, content: string): string {
  return `Please generate a structured study summary for the following material:

Material Title: "${materialTitle}"

--- CONTENT START ---
${content}
--- CONTENT END ---

Output format requirements:
- **Core Summary**: High-level synthesis (2-3 paragraphs).
- **Key Concepts**: Bulleted breakdown of essential ideas and definitions.
- **Important Takeaways**: Critical takeaways for revision.`;
}

export function buildExplanationPrompt(topic: string, materialContent?: string): string {
  return `Please explain the following concept:

Topic: "${topic}"

${materialContent ? `Context from study material:\n"""\n${materialContent.slice(0, 8000)}\n"""` : ''}

Break down the concept clearly, providing at least one concrete real-world analogy.`;
}

export function buildExamPrompt(
  content: string,
  questionCount: number,
  types: QuestionType[]
): string {
  return `Create an exam consisting of exactly ${questionCount} questions based on this study content.
Allowed question types to mix: ${types.join(', ')}.

--- CONTENT START ---
${content.slice(0, 25000)}
--- CONTENT END ---

Output STRICT JSON with this schema:
{
  "questions": [
    {
      "type": "mcq" | "truefalse" | "open" | "fillblank",
      "questionText": "Question statement or prompt",
      "options": ["Option A", "Option B", "Option C", "Option D"], // only for mcq, 4 items
      "correctAnswer": "Exact text or choice letter",
      "explanation": "Why this answer is correct based on the text"
    }
  ]
}`;
}

export function buildEvaluationPrompt(
  questionText: string,
  expectedAnswer: string,
  userAnswer: string
): string {
  return `Evaluate this student's response:

Question: ${questionText}
Expected / Reference Answer: ${expectedAnswer}
Student's Answer: ${userAnswer}

Output STRICT JSON with this format:
{
  "score": 1.0, // float between 0.0 and 1.0
  "isCorrect": true, // boolean (true if score >= 0.7)
  "aiFeedback": "Constructive explanation highlighting strengths and specific areas to review."
}`;
}
