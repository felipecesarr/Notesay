"use server";

/**
 * CONTROLLER LAYER - Notes Feature
 * Handles I/O operations for notes
 */

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import { generateChatResponse } from "@/meetmate/services/ai/gemini";
import {
  createHighlightNote,
  createTranscriptNote,
  createFeedbackNote,
  type NoteCategory,
  type Note,
  type FeedbackMetadata,
} from "../procedure";

export type { Note, NoteCategory, FeedbackMetadata };

/**
 * Save a highlight note
 */
export async function saveHighlightNote(
  selectedText: string,
  context: string,
  sourceType: "youtube" | "practice-text" | "other",
  sourceId?: string,
  timestamp?: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const noteData = createHighlightNote(
      session.user.id,
      selectedText,
      context,
      sourceType,
      sourceId,
      timestamp
    );

    const note = await prisma.note.create({
      data: {
        ...noteData,
        metadata: noteData.metadata ? JSON.stringify(noteData.metadata) : null,
      },
    });

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error saving highlight note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save note",
    };
  }
}

/**
 * Save a transcript note
 */
export async function saveTranscriptNote(
  title: string,
  transcript: string,
  duration: number,
  questionCount: number,
  skill: string,
  interviewMode: "ai-asks" | "user-asks",
  sourceId?: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const noteData = createTranscriptNote(
      session.user.id,
      title,
      transcript,
      duration,
      questionCount,
      skill,
      interviewMode,
      sourceId
    );

    const note = await prisma.note.create({
      data: {
        ...noteData,
        metadata: noteData.metadata ? JSON.stringify(noteData.metadata) : null,
      },
    });

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error saving transcript note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save note",
    };
  }
}

/**
 * Save a feedback note (for interview sessions)
 */
export async function saveFeedbackNote(
  title: string,
  feedback: FeedbackMetadata,
  sourceId?: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const noteData = createFeedbackNote(
      session.user.id,
      title,
      feedback,
      sourceId
    );

    const note = await prisma.note.create({
      data: {
        ...noteData,
        metadata: noteData.metadata ? JSON.stringify(noteData.metadata) : null,
      },
    });

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error saving feedback note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save note",
    };
  }
}

/**
 * Save a language feedback note (from chat feedback)
 */
export async function saveFeedbackNoteFromText(
  feedbackText: string,
  userMessage: string,
  sourceId?: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Create title from user message
    const title = `English Feedback: "${userMessage.slice(0, 40)}${userMessage.length > 40 ? '...' : ''}"`;

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        category: "FEEDBACK",
        title,
        content: feedbackText,
        metadata: JSON.stringify({
          userMessage,
          feedbackType: "language",
          savedAt: new Date().toISOString(),
        }),
        sourceId,
      },
    });

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error saving language feedback note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save feedback note",
    };
  }
}

/**
 * Create a personal note (user-created)
 */
export async function createPersonalNote(
  title: string,
  content: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Validate inputs
    if (!title.trim()) {
      return { success: false, error: "Title is required" };
    }

    if (!content.trim()) {
      return { success: false, error: "Content is required" };
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        category: "PERSONAL",
        title: title.trim(),
        content: content.trim(),
        metadata: JSON.stringify({
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error creating personal note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create note",
    };
  }
}

/**
 * Get all notes for the current user
 */
export async function getNotes(
  category?: NoteCategory
): Promise<{ success: boolean; notes?: Note[]; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        ...(category && { category }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      notes: notes.map((note) => ({
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      })) as Note[],
    };
  } catch (error) {
    console.error("Error fetching notes:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch notes",
    };
  }
}

/**
 * Get a single note by ID
 */
export async function getNote(
  id: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error fetching note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch note",
    };
  }
}

/**
 * Delete a note
 */
export async function deleteNote(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    await prisma.note.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete note",
    };
  }
}

/**
 * Update a note
 */
export async function updateNote(
  id: string,
  updates: { title?: string; content?: string }
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const note = await prisma.note.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: updates,
    });

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error updating note:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update note",
    };
  }
}

/**
 * Generate an AI-powered chat title
 */
async function generateChatTitle(messages: Array<{ role: "ai" | "user"; content: string }>): Promise<string> {
  try {
    // Get first few messages for context
    const conversationSummary = messages
      .slice(0, 4)
      .map(m => `${m.role === "ai" ? "AI" : "User"}: ${m.content.slice(0, 100)}`)
      .join("\n");

    const systemPrompt = "You are a creative assistant that generates short, catchy, and descriptive chat titles. Generate titles that are 2-5 words maximum. Be creative but clear about the topic.";
    const userPrompt = `Based on this conversation, generate a short, catchy title (2-5 words max):\n\n${conversationSummary}\n\nTitle:`;

    const aiTitle = await generateChatResponse(systemPrompt, userPrompt, 0.8);

    // Clean up the title
    return aiTitle.replace(/['"]/g, '').trim().slice(0, 40);
  } catch (error) {
    console.error("Failed to generate AI title:");
    // Fallback to first user message
    const firstUserMessage = messages.find(m => m.role === "user");
    return firstUserMessage
      ? firstUserMessage.content.slice(0, 30) + "..."
      : `Chat - ${new Date().toLocaleDateString()}`;
  }
}

/**
 * Save a chat conversation as a note
 */
export async function saveChatConversation(
  messages: Array<{ role: "ai" | "user"; content: string; sources?: Array<{ id: string; title: string; type: "youtube" | "text" }> }>,
  skill?: string
): Promise<{ success: boolean; note?: Note; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    if (!messages || messages.length === 0) {
      return { success: false, error: "No messages to save" };
    }

    // Save messages as JSON for easy parsing when loading
    const formattedContent = JSON.stringify(messages);

    // Generate AI-powered title
    const title = await generateChatTitle(messages);

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content: formattedContent,
        category: "CHAT",
        metadata: JSON.stringify({
          messageCount: messages.length,
          skill: skill || "General",
          savedAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      note: {
        ...note,
        metadata: note.metadata ? JSON.parse(note.metadata) : undefined,
      } as Note,
    };
  } catch (error) {
    console.error("Error saving chat conversation:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save conversation",
    };
  }
}

/**
 * Get all saved chat conversations
 */
export async function getChatConversations(): Promise<{ success: boolean; chats?: Note[]; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const chats = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        category: "CHAT",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        metadata: true,
      },
    });

    return {
      success: true,
      chats: chats.map((chat) => ({
        ...chat,
        content: "", // Don't load full content for list
        metadata: chat.metadata ? JSON.parse(chat.metadata) : undefined,
      })) as Note[],
    };
  } catch (error) {
    console.error("Error fetching chat conversations:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch chats",
    };
  }
}
