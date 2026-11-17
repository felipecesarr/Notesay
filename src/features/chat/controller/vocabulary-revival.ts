/**
 * CONTROLLER LAYER - Vocabulary Revival
 * Handles I/O for vocabulary usage tracking
 */

"use server";

import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { prisma } from "@/meetmate/services/db/prisma";
import {
  getPriorityVocabulary,
  detectUsedVocabulary,
  type FlashcardWithUsage,
  type VocabularyPriority,
} from "../procedure/vocabulary-revival";

/**
 * Get priority vocabulary for chat conversation
 * Returns flashcards that need practice most urgently
 */
export async function getPriorityVocabularyForChat(
  count: number = 5
): Promise<{
  success: boolean;
  priorities?: VocabularyPriority[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch all flashcards with usage data
    const flashcards = await prisma.flashcard.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        front: true,
        back: true,
        nextReview: true,
        lastUsedInChat: true,
        chatUsageCount: true,
        interval: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (flashcards.length === 0) {
      return { success: true, priorities: [] };
    }

    // Calculate priorities using procedure logic
    const priorities = getPriorityVocabulary(
      flashcards as FlashcardWithUsage[],
      count
    );

    return { success: true, priorities };
  } catch (error) {
    console.error("Failed to get priority vocabulary:");
    return { success: false, error: "Failed to get priority vocabulary" };
  }
}

/**
 * Track vocabulary usage in chat message
 * Updates lastUsedInChat and chatUsageCount for detected words
 */
export async function trackVocabularyUsage(
  aiMessage: string
): Promise<{ success: boolean; usedWordIds?: string[]; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Get all user's flashcards
    const flashcards = await prisma.flashcard.findMany({
      where: { userId: session.user.id },
      select: { id: true, front: true },
    });

    if (flashcards.length === 0) {
      return { success: true, usedWordIds: [] };
    }

    // Detect which words were used in AI message
    const usedWordIds = detectUsedVocabulary(aiMessage, flashcards);

    if (usedWordIds.length === 0) {
      return { success: true, usedWordIds: [] };
    }

    // Update usage tracking for detected words
    const now = new Date();
    await prisma.flashcard.updateMany({
      where: {
        id: { in: usedWordIds },
        userId: session.user.id,
      },
      data: {
        lastUsedInChat: now,
        chatUsageCount: { increment: 1 },
      },
    });

    return { success: true, usedWordIds };
  } catch (error) {
    console.error("Failed to track vocabulary usage:");
    return { success: false, error: "Failed to track vocabulary usage" };
  }
}

/**
 * Get vocabulary statistics for a user
 */
export async function getVocabularyStats(): Promise<{
  success: boolean;
  stats?: {
    total: number;
    neverUsed: number;
    usedRecently: number; // Last 7 days
    needsRevival: number; // Not used in 14+ days
    overdue: number; // Overdue for review
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [total, neverUsed, usedRecently, needsRevival, overdue] =
      await Promise.all([
        // Total flashcards
        prisma.flashcard.count({
          where: { userId: session.user.id },
        }),

        // Never used in chat
        prisma.flashcard.count({
          where: {
            userId: session.user.id,
            lastUsedInChat: null,
          },
        }),

        // Used in last 7 days
        prisma.flashcard.count({
          where: {
            userId: session.user.id,
            lastUsedInChat: { gte: sevenDaysAgo },
          },
        }),

        // Not used in 14+ days (needs revival)
        prisma.flashcard.count({
          where: {
            userId: session.user.id,
            OR: [
              { lastUsedInChat: { lt: fourteenDaysAgo } },
              { lastUsedInChat: null },
            ],
          },
        }),

        // Overdue for spaced repetition review
        prisma.flashcard.count({
          where: {
            userId: session.user.id,
            nextReview: { lt: now },
          },
        }),
      ]);

    return {
      success: true,
      stats: {
        total,
        neverUsed,
        usedRecently,
        needsRevival,
        overdue,
      },
    };
  } catch (error) {
    console.error("Failed to get vocabulary stats:");
    return { success: false, error: "Failed to get vocabulary stats" };
  }
}
