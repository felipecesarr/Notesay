"use server";

/**
 * CONTROLLER LAYER - Feedback Feature
 * Handles I/O operations for feedback
 */

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import {
  createFeedback,
  type Feedback,
  buildFeedbackSummaryPrompt,
  formatFeedbackLogs,
} from "../procedure";
import { generateChatResponse } from "@/meetmate/services/ai/gemini";

export type { Feedback };

/**
 * Save a feedback entry
 */
export async function saveFeedback(
  userMessage: string,
  feedbackText: string,
  chatMessageId?: string,
  sourceId?: string,
): Promise<{ success: boolean; feedback?: Feedback; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const feedbackData = createFeedback(
      session.user.id,
      userMessage,
      feedbackText,
      chatMessageId,
      sourceId,
    );

    const feedback = await prisma.feedback.create({
      data: feedbackData,
    });

    return {
      success: true,
      feedback: feedback as Feedback,
    };
  } catch (error) {
    console.error("Error saving feedback:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save feedback",
    };
  }
}

/**
 * Get feedback by ID
 */
export async function getFeedbackByIdServer(
  feedbackId: string,
): Promise<{ success: boolean; feedback?: Feedback; error?: string }> {
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

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        userId: session.user.id,
      },
    });

    if (!feedback) {
      return { success: false, error: "Feedback not found" };
    }

    return {
      success: true,
      feedback: feedback as Feedback,
    };
  } catch (error) {
    console.error("Error fetching feedback:");
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch feedback",
    };
  }
}

/**
 * Get feedback by chat message ID
 */
export async function getFeedbackByMessageId(
  chatMessageId: string,
): Promise<{ success: boolean; feedback?: Feedback; error?: string }> {
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

    const feedback = await prisma.feedback.findFirst({
      where: {
        userId: session.user.id,
        chatMessageId,
      },
    });

    if (!feedback) {
      return { success: false, error: "Feedback not found" };
    }

    return {
      success: true,
      feedback: feedback as Feedback,
    };
  } catch (error) {
    console.error("Error fetching feedback:");
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch feedback",
    };
  }
}

/**
 * Get all feedbacks for the current user
 */
export async function getAllFeedbacks(): Promise<{
  success: boolean;
  feedbacks?: Feedback[];
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

    const feedbacks = await prisma.feedback.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      feedbacks: feedbacks as Feedback[],
    };
  } catch (error) {
    console.error("Error fetching feedbacks:");
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch feedbacks",
    };
  }
}

/**
 * Mark feedback as saved to notes
 */
export async function markFeedbackSaved(
  feedbackId: string,
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

    await prisma.feedback.update({
      where: {
        id: feedbackId,
        userId: session.user.id,
      },
      data: {
        savedToNotes: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking feedback as saved:");
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update feedback",
    };
  }
}

/**
 * Delete a feedback entry
 */
export async function deleteFeedback(
  feedbackId: string,
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

    await prisma.feedback.delete({
      where: {
        id: feedbackId,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting feedback:");
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete feedback",
    };
  }
}

/**
 * Generate a compilation summary of recent feedback
 */
export async function generateFeedbackSummary(
  chatId?: string,
  userMessages?: string[],
): Promise<{ success: boolean; summary?: string; error?: string }> {
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

    const feedbackIds: string[] = [];
    let fallbackMessageContents: string[] = [];
    let isNewChat = false;

    // Strategy 1: Use explicitly provided messages (New/Unsaved Chat)
    if (userMessages && userMessages.length > 0) {
      fallbackMessageContents = userMessages;
      isNewChat = true;
    }
    // Strategy 2: Fetch from DB using chatId (Saved Chat)
    else if (chatId) {
      const chatMessages = await prisma.chatMessage.findMany({
        where: { sessionId: chatId, role: "user" },
        select: { content: true, sources: true },
      });

      // Attempt to extract explicit feedback IDs from the packed 'sources' JSON
      // Format: { s: [], f: "feedback-id" }
      chatMessages.forEach((msg) => {
        if (msg.sources) {
          try {
            const parsed = JSON.parse(msg.sources);
            // Check for packed format containing 'f' (feedbackId)
            if (parsed && typeof parsed === "object" && "f" in parsed) {
              feedbackIds.push(parsed.f);
            }
          } catch {
            // Ignore parse errors
          }
        }
        fallbackMessageContents.push(msg.content);
      });
    } else {
      return {
        success: true,
        summary: "Start a conversation to get personalized feedback!",
      };
    }

    // SCALABILITY: Check Cache First
    if (chatId) {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: chatId, userId: session.user.id },
        select: { metadata: true, updatedAt: true },
      });

      if (chatSession?.metadata) {
        try {
          const meta = JSON.parse(chatSession.metadata);
          // If summary exists and was generated AFTER the last chat update (or reasonably close), use it
          // We allow a small buffer (e.g. 10 seconds) or just check if it exists and is recent
          // Better strategy: If chat hasn't been updated since generation, it's valid.
          if (meta.feedbackSummary && meta.feedbackGeneratedAt) {
            const genTime = new Date(meta.feedbackGeneratedAt).getTime();
            const updateTime = new Date(chatSession.updatedAt).getTime();

            // If generated shortly after the last update (within 2 mins) or later, it's fresh.
            // We give a window because 'updatedAt' might change slightly after generation.
            if (genTime > updateTime - 120000) {
              return { success: true, summary: meta.feedbackSummary };
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }

    // QUERY Logic (Same as before)
    // ... [existing query logic is fine, we just wrap it] ...

    // FETCH FEEDBACKS (Copying previous robust logic)
    let feedbacks;
    if (feedbackIds.length > 0) {
      feedbacks = await prisma.feedback.findMany({
        where: { userId: session.user.id, id: { in: feedbackIds } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { userMessage: true, feedbackText: true, createdAt: true },
      });
    } else {
      feedbacks = await prisma.feedback.findMany({
        where: {
          userId: session.user.id,
          userMessage: { in: fallbackMessageContents },
          ...(isNewChat ? { chatMessageId: null } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { userMessage: true, feedbackText: true, createdAt: true },
      });
    }

    if (feedbacks.length === 0) {
      return {
        success: true,
        summary: "No corrections yet in this chat. Keep practicing!",
      };
    }

    // Prepare data for AI (moved to procedure)
    const feedbackContent = formatFeedbackLogs(feedbacks);
    const systemPrompt = buildFeedbackSummaryPrompt();

    // Increased temperature slightly for more natural synthesis
    const summary = await generateChatResponse(
      systemPrompt,
      `Analyze these logs and generate the Quick Review:\n\n${feedbackContent}`,
      0.6,
    );

    const finalSummary = summary || "Failed to generate summary.";

    // SCALABILITY: Write Cache Back to DB
    if (chatId && finalSummary && !finalSummary.includes("Failed")) {
      // We fire-and-forget the update to not block response
      // Fetch current metadata first to preserve other fields
      prisma.chatSession
        .findUnique({ where: { id: chatId }, select: { metadata: true } })
        .then((current) => {
          let newMeta = {};
          if (current?.metadata) {
            try {
              newMeta = JSON.parse(current.metadata);
            } catch { }
          }
          newMeta = {
            ...newMeta,
            feedbackSummary: finalSummary,
            feedbackGeneratedAt: new Date().toISOString(),
          };

          prisma.chatSession
            .update({
              where: { id: chatId },
              data: { metadata: JSON.stringify(newMeta) },
            })
            .catch((e) =>
              console.error("Failed to cache feedback summary:"),
            );
        });
    }

    return {
      success: true,
      summary: finalSummary,
    };
  } catch (error) {
    console.error("Error generating feedback summary:");
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate summary",
    };
  }
}
