"use server";

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";

/**
 * CONTROLLER LAYER - Interview Messages
 * Handles all I/O operations for interview sessions (DB)
 * Completely separate from Chat feature
 */

export interface InterviewMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface InterviewSession {
  id: string;
  title: string;
  skillId?: string;
  messages: InterviewMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new interview session
 */
export async function createInterviewSession(
  title: string,
  skillId?: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
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

    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        title,
        skillId,
      },
    });

    return { success: true, sessionId: interviewSession.id };
  } catch (error) {
    console.error("Error creating interview session:");
    return { success: false, error: "Failed to create session" };
  }
}

/**
 * Add message to interview session
 */
export async function addInterviewMessage(
  sessionId: string,
  role: "user" | "ai",
  content: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
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

    // Verify session belongs to user
    const interviewSession = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!interviewSession) {
      return { success: false, error: "Session not found" };
    }

    const message = await prisma.interviewMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });

    return { success: true, messageId: message.id };
  } catch (error) {
    console.error("Error adding interview message:");
    return { success: false, error: "Failed to add message" };
  }
}

/**
 * Get interview session with messages
 */
export async function getInterviewSession(
  sessionId: string
): Promise<{ success: boolean; session?: InterviewSession; error?: string }> {
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

    const interviewSession = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!interviewSession) {
      return { success: false, error: "Session not found" };
    }

    return {
      success: true,
      session: {
        id: interviewSession.id,
        title: interviewSession.title,
        skillId: interviewSession.skillId || undefined,
        messages: interviewSession.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "ai",
          content: msg.content,
          timestamp: msg.timestamp,
        })),
        createdAt: interviewSession.createdAt,
        updatedAt: interviewSession.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error getting interview session:");
    return { success: false, error: "Failed to get session" };
  }
}

/**
 * Get all interview sessions for user
 */
export async function getInterviewSessions(): Promise<{
  success: boolean;
  sessions?: Array<{
    id: string;
    title: string;
    createdAt: Date;
    messageCount: number;
  }>;
  error?: string;
}> {
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

    const sessions = await prisma.interviewSession.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        messageCount: s._count.messages,
      })),
    };
  } catch (error) {
    console.error("Error getting interview sessions:");
    return { success: false, error: "Failed to get sessions" };
  }
}

/**
 * Delete interview session
 */
export async function deleteInterviewSession(
  sessionId: string
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

    await prisma.interviewSession.delete({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview session:");
    return { success: false, error: "Failed to delete session" };
  }
}

/**
 * Save interview session as a transcript note
 */
export async function saveInterviewTranscript(
  sessionId: string,
  skill?: string
): Promise<{ success: boolean; noteId?: string; error?: string }> {
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

    // Get the interview session with messages
    const interviewSession = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!interviewSession) {
      return { success: false, error: "Session not found" };
    }

    // Format transcript
    const transcript = interviewSession.messages
      .map((msg) => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const role = msg.role === "user" ? "You" : "AI";
        return `[${time}] ${role}: ${msg.content}`;
      })
      .join("\n\n");

    // Calculate duration (from first to last message)
    const duration =
      interviewSession.messages.length > 0
        ? Math.floor(
            (interviewSession.messages[interviewSession.messages.length - 1].timestamp.getTime() -
              interviewSession.messages[0].timestamp.getTime()) /
              1000
          )
        : 0;

    // Save as TRANSCRIPT note
    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        category: "TRANSCRIPT",
        title: interviewSession.title,
        content: transcript,
        sourceId: sessionId,
        metadata: JSON.stringify({
          duration,
          messageCount: interviewSession.messages.length,
          skill: skill || "General",
          interviewMode: "ai-asks", // Default, can be enhanced later
          savedAt: new Date().toISOString(),
        }),
      },
    });

    return { success: true, noteId: note.id };
  } catch (error) {
    console.error("Error saving interview transcript:");
    return { success: false, error: "Failed to save transcript" };
  }
}
