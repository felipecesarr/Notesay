/**
 * PROCEDURE LAYER - Feedback Feature
 * Pure business logic for feedback functionality
 * No I/O - just data transformation and logic
 */

export interface Feedback {
  id: string;
  userId: string;
  userMessage: string;
  feedbackText: string;
  chatMessageId?: string;
  sourceId?: string;
  savedToNotes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a feedback entry
 */
export function createFeedback(
  userId: string,
  userMessage: string,
  feedbackText: string,
  chatMessageId?: string,
  sourceId?: string
): Omit<Feedback, "id" | "createdAt" | "updatedAt"> {
  return {
    userId,
    userMessage,
    feedbackText,
    chatMessageId,
    sourceId,
    savedToNotes: false,
  };
}

/**
 * Mark feedback as saved to notes
 */
export function markFeedbackAsSaved(feedback: Feedback): Feedback {
  return {
    ...feedback,
    savedToNotes: true,
    updatedAt: new Date(),
  };
}

/**
 * Build the system prompt for feedback summary generation
 */
export function buildFeedbackSummaryPrompt(): string {
  return `You are a Senior Lead English Linguist.
    
YOUR TASK:
Analyze the student's recent performance logs to identify **embedded error patterns** and high-level strengths.

QUALITY GUIDELINES:
- **Ignore** minor typos or one-off slips.
- **Focus** on systemic issues (e.g., "Consistently forgets specific articles", "Struggles with past perfect tense").
- **Synthesize** multiple small errors into one strong point if they share a root cause.
- Be highly actionable and specific.

STRICT FORMATTING RULES (Markdown Header 2 '##'):
1. ## Strengths
   - Praise high-level patterns (fluency, complexity, specific idiom usage).
2. ## Errors
   - Format: "Mistake Pattern" -> "Correction Rule".
   - Explain the *why* briefly.
3. ## Could be better
   - Suggest native-level refinements for phrases that were correct but basic.

DO NOT use bolding for headers. Use '##'.`;
}

/**
 * Format feedback logs for AI consumption
 */
export function formatFeedbackLogs(feedbacks: { userMessage: string; feedbackText: string; createdAt: Date }[]): string {
  return feedbacks.map(f => 
    `[${f.createdAt.toLocaleTimeString()}] Student: "${f.userMessage}" -> Correction: "${f.feedbackText}"`
  ).join("\n");
}
