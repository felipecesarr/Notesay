/**
 * PROCEDURE LAYER - Notes Feature
 * Pure business logic for notes functionality
 * No I/O - just data transformation and logic
 */

export type NoteCategory = "HIGHLIGHT" | "TRANSCRIPT" | "FEEDBACK" | "CHAT" | "PERSONAL";

export interface Note {
  id: string;
  userId: string;
  category: NoteCategory;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HighlightMetadata {
  selectedText: string;
  context: string;
  sourceType: "youtube" | "practice-text" | "other";
  timestamp?: string;
}

export interface TranscriptMetadata {
  duration: number; // in minutes
  questionCount: number;
  skill: string;
  interviewMode: "ai-asks" | "user-asks";
}

export interface FeedbackMetadata {
  overallPerformance: string;
  strengths: string[];
  areasToImprove: string[];
  nextSteps: string;
  encouragement: string;
  sessionId?: string;
}

/**
 * Create a highlight note
 */
export function createHighlightNote(
  userId: string,
  selectedText: string,
  context: string,
  sourceType: "youtube" | "practice-text" | "other",
  sourceId?: string,
  timestamp?: string
): Omit<Note, "id" | "createdAt" | "updatedAt"> {
  const metadata: HighlightMetadata = {
    selectedText,
    context,
    sourceType,
    timestamp,
  };

  return {
    userId,
    category: "HIGHLIGHT",
    title: selectedText.substring(0, 50) + (selectedText.length > 50 ? "..." : ""),
    content: selectedText,
    metadata: metadata as unknown as Record<string, unknown>,
    sourceId,
  };
}

/**
 * Create a transcript note
 */
export function createTranscriptNote(
  userId: string,
  title: string,
  transcript: string,
  duration: number,
  questionCount: number,
  skill: string,
  interviewMode: "ai-asks" | "user-asks",
  sourceId?: string
): Omit<Note, "id" | "createdAt" | "updatedAt"> {
  const metadata: TranscriptMetadata = {
    duration,
    questionCount,
    skill,
    interviewMode,
  };

  return {
    userId,
    category: "TRANSCRIPT",
    title,
    content: transcript,
    metadata: metadata as unknown as Record<string, unknown>,
    sourceId,
  };
}

/**
 * Create a feedback note
 */
export function createFeedbackNote(
  userId: string,
  title: string,
  feedback: FeedbackMetadata,
  sourceId?: string
): Omit<Note, "id" | "createdAt" | "updatedAt"> {
  // Store the full feedback object as content (JSON stringified)
  const content = JSON.stringify(feedback, null, 2);

  return {
    userId,
    category: "FEEDBACK",
    title,
    content,
    metadata: feedback as unknown as Record<string, unknown>,
    sourceId,
  };
}

/**
 * Parse feedback from note content
 * Returns FeedbackMetadata for interview feedback, null for language feedback
 */
export function parseFeedbackNote(note: Note): FeedbackMetadata | null {
  if (note.category !== "FEEDBACK") {
    return null;
  }

  try {
    // Check if this is language feedback (has feedbackType: "language" in metadata)
    if (note.metadata && typeof note.metadata === "object") {
      const metadata = note.metadata as { feedbackType?: unknown };

      // If it's language feedback, return null (will be handled differently in UI)
      if (metadata.feedbackType === "language") {
        return null;
      }

      // Otherwise, it's interview feedback
      return note.metadata as unknown as FeedbackMetadata;
    }

    // Fallback to parsing content if metadata not available (old interview feedback)
    return JSON.parse(note.content);
  } catch (error) {
    console.error("Error parsing feedback note:");
    return null;
  }
}

/**
 * Format note for display
 */
export function formatNotePreview(note: Note, maxLength: number = 100): string {
  if (note.category === "FEEDBACK") {
    const feedback = parseFeedbackNote(note);
    return feedback ? feedback.overallPerformance : note.content.substring(0, maxLength);
  }

  return note.content.length > maxLength
    ? note.content.substring(0, maxLength) + "..."
    : note.content;
}

/**
 * Group notes by category
 */
export function groupNotesByCategory(notes: Note[]): Record<NoteCategory, Note[]> {
  return {
    HIGHLIGHT: notes.filter((n) => n.category === "HIGHLIGHT"),
    TRANSCRIPT: notes.filter((n) => n.category === "TRANSCRIPT"),
    FEEDBACK: notes.filter((n) => n.category === "FEEDBACK"),
    CHAT: notes.filter((n) => n.category === "CHAT"),
    PERSONAL: notes.filter((n) => n.category === "PERSONAL"),
  };
}

/**
 * Sort notes by date
 */
export function sortNotesByDate(
  notes: Note[],
  order: "asc" | "desc" = "desc"
): Note[] {
  return [...notes].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Filter notes by search query
 */
export function filterNotesBySearch(notes: Note[], query: string): Note[] {
  const lowerQuery = query.toLowerCase();

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get note statistics
 */
export function getNoteStats(notes: Note[]): {
  total: number;
  highlights: number;
  transcripts: number;
  feedbacks: number;
  chats: number;
  personals: number;
} {
  const grouped = groupNotesByCategory(notes);

  return {
    total: notes.length,
    highlights: grouped.HIGHLIGHT.length,
    transcripts: grouped.TRANSCRIPT.length,
    feedbacks: grouped.FEEDBACK.length,
    chats: grouped.CHAT.length,
    personals: grouped.PERSONAL.length,
  };
}
