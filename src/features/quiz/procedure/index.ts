/**
 * PROCEDURE LAYER - Quiz Feature
 * Pure business logic for quiz mode functionality
 * No I/O - just data transformation and logic
 */

export interface QuizQuestion {
  id: string;
  question: string;
  askedAt: Date;
  sourceIds: string[]; // IDs of videos/texts used
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  answeredAt: Date;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  sourceIds: string[];
  startedAt: Date;
  endedAt?: Date;
}

/**
 * Build system prompt for quiz mode
 */
export function buildQuizModePrompt(
  sourceNames: string[],
  previousQuestions: string[]
): string {
  const sourcesText = sourceNames.join(", ");

  let prompt = `You are a helpful English teacher in quiz mode. Your role is to ask questions about the content the user is studying to help them learn.

CONTENT SOURCES: ${sourcesText}

BEHAVIOR:
- Ask ONE clear, specific question at a time about the content from these sources
- Make questions that test understanding, not just memorization
- Keep questions concise and clear (max 30 words)
- Vary question types: comprehension, analysis, application
- Build on previous questions to deepen understanding
- Be encouraging and supportive
- Reference specific parts of the content when asking questions`;

  if (previousQuestions.length > 0) {
    prompt += `\n\nPrevious questions you've asked:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
    prompt += `\n\nMake sure your next question explores a different aspect or builds deeper on what you've already asked.`;
  } else {
    prompt += `\n\nThis is the first question. Start with a foundational question about the main topic or key concepts.`;
  }

  return prompt;
}

/**
 * Build user prompt for quiz question generation
 */
export function buildQuizQuestionPrompt(
  userPreviousAnswer?: string
): string {
  if (userPreviousAnswer) {
    return `Based on my previous answer: "${userPreviousAnswer}"\n\nWhat's your next question to help me learn more about the content?`;
  }

  return "Ask me a question about the content to help me learn.";
}

/**
 * Validate quiz question
 */
export function validateQuizQuestion(question: string): {
  isValid: boolean;
  error?: string;
} {
  if (!question || !question.trim()) {
    return { isValid: false, error: "Question cannot be empty" };
  }

  if (question.length > 200) {
    return { isValid: false, error: "Question is too long (max 200 characters)" };
  }

  if (question.length < 10) {
    return { isValid: false, error: "Question is too short (min 10 characters)" };
  }

  return { isValid: true };
}

/**
 * Create a new quiz session
 */
export function createQuizSession(sourceIds: string[]): QuizSession {
  return {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    questions: [],
    answers: [],
    sourceIds,
    startedAt: new Date(),
  };
}

/**
 * Add question to session
 */
export function addQuestionToSession(
  session: QuizSession,
  question: string,
  sourceIds: string[]
): QuizSession {
  const newQuestion: QuizQuestion = {
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    question,
    askedAt: new Date(),
    sourceIds,
  };

  return {
    ...session,
    questions: [...session.questions, newQuestion],
  };
}

/**
 * Add answer to session
 */
export function addAnswerToSession(
  session: QuizSession,
  questionId: string,
  answer: string
): QuizSession {
  const newAnswer: QuizAnswer = {
    questionId,
    answer,
    answeredAt: new Date(),
  };

  return {
    ...session,
    answers: [...session.answers, newAnswer],
  };
}

/**
 * End quiz session
 */
export function endQuizSession(session: QuizSession): QuizSession {
  return {
    ...session,
    endedAt: new Date(),
  };
}

/**
 * Calculate quiz statistics
 */
export function calculateQuizStats(session: QuizSession): {
  totalQuestions: number;
  totalAnswers: number;
  duration: number; // in minutes
  completionRate: number; // percentage
} {
  const totalQuestions = session.questions.length;
  const totalAnswers = session.answers.length;

  const endTime = session.endedAt || new Date();
  const duration = Math.round(
    (endTime.getTime() - session.startedAt.getTime()) / 1000 / 60
  );

  const completionRate =
    totalQuestions > 0 ? (totalAnswers / totalQuestions) * 100 : 0;

  return {
    totalQuestions,
    totalAnswers,
    duration,
    completionRate,
  };
}

/**
 * Format quiz session for display
 */
export function formatQuizHistory(
  session: QuizSession
): Array<{ question: string; answer?: string; timestamp: Date }> {
  const history: Array<{ question: string; answer?: string; timestamp: Date }> =
    [];

  session.questions.forEach((q) => {
    const answer = session.answers.find((a) => a.questionId === q.id);
    history.push({
      question: q.question,
      answer: answer?.answer,
      timestamp: q.askedAt,
    });
  });

  return history;
}

/**
 * Check if user should get feedback based on quiz progress
 */
export function shouldProvideFeedback(session: QuizSession): boolean {
  const stats = calculateQuizStats(session);

  // Provide feedback after every 5 questions or at session end
  return stats.totalQuestions % 5 === 0 && stats.totalQuestions > 0;
}

/**
 * Generate feedback prompt for AI
 */
export function buildFeedbackPrompt(session: QuizSession): string {
  const history = formatQuizHistory(session);
  const stats = calculateQuizStats(session);

  const prompt = `You are providing feedback on a quiz session. Here's the summary:

Duration: ${stats.duration} minutes
Questions asked: ${stats.totalQuestions}
Questions answered: ${stats.totalAnswers}

Quiz History:
${history
  .map(
    (h, i) =>
      `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer || "(not answered)"}\n`
  )
  .join("\n")}

Provide encouraging, constructive feedback in JSON format:
{
  "overallPerformance": "Brief summary of how they did (2-3 sentences)",
  "strengths": ["strength 1", "strength 2"],
  "areasToImprove": ["area 1", "area 2"],
  "nextSteps": "Specific actionable advice for continued learning",
  "encouragement": "Motivational closing message"
}`;

  return prompt;
}
