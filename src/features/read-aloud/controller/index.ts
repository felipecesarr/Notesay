"use server";

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPracticeTextPrompt } from "../procedure";
import { z } from "zod";
import {
  trackTokenUsage,
  extractTokenMetadata
} from "@/meetmate/services/token-tracking";

// Zod validation schemas
const savePracticeTextSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(10, "Content must be at least 10 characters").max(10000, "Content is too long"),
  topic: z.string().min(1, "Topic is required").max(500, "Topic is too long"),
});

const generatePracticeTextSchema = z.object({
  topics: z.array(z.string()).min(1, "At least one topic is required").max(10, "Too many topics"),
  size: z.enum(['small', 'medium', 'large'], { message: "Size must be small, medium, or large" }),
  flashcardWords: z.array(z.string()).max(50, "Too many flashcard words"),
});

const saveProgressSchema = z.object({
  textId: z.string().cuid("Invalid text ID"),
  mode: z.enum(['read-aloud', 'shadowing', 'listening'], { message: "Invalid mode" }),
  completedChunks: z.number().int().min(0, "Completed chunks must be non-negative"),
  totalChunks: z.number().int().min(1, "Total chunks must be at least 1"),
  completedIndices: z.array(z.number().int().min(0)).optional(),
});

const getProgressSchema = z.object({
  textId: z.string().cuid("Invalid text ID"),
});

const deletePracticeTextSchema = z.object({
  textId: z.string().cuid("Invalid text ID"),
});

export type PracticeText = {
  id: string;
  title: string;
  content: string;
  topic: string;
  createdAt: Date;
};

export type ModeProgress = {
  completedChunks: number;
  totalChunks: number;
  completedIndices: number[];
};

export type ProgressMap = Record<string, ModeProgress>;

type PrismaProgressRecord = {
  mode: string;
  completedChunks: number;
  totalChunks: number;
  completedIndices: string;
};

export async function getPracticeTexts(): Promise<{ success: boolean; texts?: PracticeText[]; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const texts = await prisma.practiceText.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, texts };
  } catch (error) {
    console.error("Failed to fetch practice texts:");
    return { success: false, error: "Failed to fetch texts" };
  }
}

export async function savePracticeText(
  title: string,
  content: string,
  topic: string
): Promise<{ success: boolean; text?: PracticeText; error?: string }> {
  try {
    // Validate input
    const validation = savePracticeTextSchema.safeParse({ title, content, topic });
    if (!validation.success) {
      const errors = validation.error.issues.map(e => e.message).join(', ');
      return { success: false, error: `Validation error: ${errors}` };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const text = await prisma.practiceText.create({
      data: {
        userId: session.user.id,
        title: validation.data.title,
        content: validation.data.content,
        topic: validation.data.topic,
      },
    });

    return { success: true, text };
  } catch (error) {
    console.error("Failed to save practice text:");
    return { success: false, error: "Failed to save text" };
  }
}

export async function generatePracticeText(
  topics: string[],
  size: 'small' | 'medium' | 'large',
  flashcardWords: string[]
): Promise<{ success: boolean; title?: string; content?: string; error?: string }> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Validate input
    const validation = generatePracticeTextSchema.safeParse({ topics, size, flashcardWords });
    if (!validation.success) {
      const errors = validation.error.issues.map(e => e.message).join(', ');
      return { success: false, error: `Validation error: ${errors}` };
    }

    // Use server-side only environment variable (no NEXT_PUBLIC_ prefix)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return { success: false, error: "API Key not configured. Please contact support." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = buildPracticeTextPrompt(validation.data.topics, validation.data.size, validation.data.flashcardWords);

    const result = await model.generateContent(prompt);

    // Track token usage
    const tokens = extractTokenMetadata(result);
    trackTokenUsage({
      userId: session.user.id,
      feature: 'read-aloud',
      action: 'generatePracticeText',
      model: 'gemini-2.5-flash-lite',
      ...tokens,
    });

    const response = result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json\n|\n```/g, "").trim();

    try {
      const data = JSON.parse(jsonString);
      return {
        success: true,
        title: data.title,
        content: data.content
      };
    } catch {
      console.error("Failed to parse AI response:");
      return { success: false, error: "Failed to parse AI response" };
    }

  } catch (error) {
    console.error("AI Generation failed:");
    return { success: false, error: "AI Generation failed" };
  }
}

export async function saveProgress(
  textId: string,
  mode: string,
  completedChunks: number,
  totalChunks: number,
  completedIndices?: number[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validation = saveProgressSchema.safeParse({ textId, mode, completedChunks, totalChunks, completedIndices });
    if (!validation.success) {
      const errors = validation.error.issues.map(e => e.message).join(', ');
      console.error("Progress validation error:");
      return { success: false, error: `Validation error: ${errors}` };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Single query with OR - find existing progress for any content type
    const existingProgress = await prisma.practiceProgress.findFirst({
      where: {
        userId: session.user.id,
        mode,
        OR: [
          { practiceTextId: textId },
          { youtubeStudyId: textId },
          { pdfStudyId: textId },
        ],
      },
    });

    if (existingProgress) {
      // Update existing record
      await prisma.practiceProgress.update({
        where: { id: existingProgress.id },
        data: {
          completedChunks,
          totalChunks,
          completedIndices: completedIndices ? JSON.stringify(completedIndices) : undefined,
          lastPracticed: new Date(),
        },
      });
    } else {
      // Determine content type
      let data: any = {
          userId: session.user.id,
          mode,
          completedChunks,
          totalChunks,
          completedIndices: completedIndices ? JSON.stringify(completedIndices) : "[]",
      };

      const isPracticeText = await prisma.practiceText.count({ where: { id: textId } }) > 0;
      if (isPracticeText) {
          data.practiceTextId = textId;
      } else {
          const isYouTubeStudy = await prisma.youTubeStudy.count({ where: { id: textId } }) > 0;
          if (isYouTubeStudy) {
              data.youtubeStudyId = textId;
          } else {
              // Assume PDF if not others, or check explicitly
              // const isPDFStudy = await prisma.pDFStudy.count({ where: { id: textId } }) > 0; // if valid
              data.pdfStudyId = textId;
          }
      }

      await prisma.practiceProgress.create({ data });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save progress:");
    return { success: false, error: "Failed to save progress" };
  }
}

export async function getProgress(
  textId: string
): Promise<{ success: boolean; progress?: ProgressMap; error?: string }> {
  try {
    // Validate input
    const validation = getProgressSchema.safeParse({ textId });
    if (!validation.success) {
      const errors = validation.error.issues.map(e => e.message).join(', ');
      return { success: false, error: `Validation error: ${errors}` };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Single query with OR - find progress for any content type
    const progress = await prisma.practiceProgress.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { practiceTextId: textId },
          { youtubeStudyId: textId },
          { pdfStudyId: textId },
        ],
      },
    });

    // Convert to object for easier access
    const progressMap: ProgressMap = {};
    progress.forEach((p: PrismaProgressRecord) => {
      progressMap[p.mode] = {
        completedChunks: p.completedChunks,
        totalChunks: p.totalChunks,
        completedIndices: JSON.parse(p.completedIndices || "[]") as number[],
      };
    });

    return { success: true, progress: progressMap };
  } catch (error) {
    console.error("Failed to get progress:");
    return { success: false, error: "Failed to get progress" };
  }
}

export async function deletePracticeText(
  textId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validation = deletePracticeTextSchema.safeParse({ textId });
    if (!validation.success) {
      const errors = validation.error.issues.map(e => e.message).join(', ');
      return { success: false, error: `Validation error: ${errors}` };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Delete the practice text (cascading delete will remove associated progress)
    await prisma.practiceText.delete({
      where: {
        id: textId,
        userId: session.user.id, // Ensure user owns this text
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete practice text:");
    return { success: false, error: "Failed to delete text" };
  }
}
