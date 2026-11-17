"use server";

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import { CreateFlashcardDTO, FlashcardResponse } from "./types";
import { validateFlashcardData } from "../procedure";

export async function saveFlashcard(data: CreateFlashcardDTO): Promise<FlashcardResponse> {
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

    // Validate data using procedure layer
    const validation = validateFlashcardData(data);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(", ") };
    }

    // Check for duplicates
    const existing = await prisma.flashcard.findFirst({
      where: {
        userId: session.user.id,
        front: { equals: data.front, mode: "insensitive" }, // Case-insensitive check
      },
    });

    if (existing) {
      return { success: false, error: "Flashcard already exists" };
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: session.user.id,
        front: data.front,
        back: data.back,
        context: data.context,
        tense: data.tense,
        phonetic: data.phonetic,
      },
    });

    return { success: true, flashcard };
  } catch (error) {
    console.error("Failed to save flashcard:");
    return { success: false, error: "Failed to save flashcard" };
  }
}

export async function getFlashcards(): Promise<FlashcardResponse> {
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

    const flashcards = await prisma.flashcard.findMany({
      where: { userId: session.user.id },
      orderBy: { nextReview: "asc" }, // Prioritize due cards
    });

    return { success: true, flashcards };
  } catch (error) {
    console.error("Failed to fetch flashcards:");
    return { success: false, error: "Failed to fetch flashcards" };
  }
}

export async function updateFlashcardProgress(
  id: string,
  rating: "again" | "hard" | "good" | "easy"
): Promise<{ success: boolean; error?: string }> {
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

    const card = await prisma.flashcard.findUnique({
      where: { id },
    });

    if (!card || card.userId !== session.user.id) {
      return { success: false, error: "Card not found" };
    }

    // Simple Spaced Repetition Logic
    let newInterval = card.interval;
    let newEase = card.easeFactor;
    const now = new Date();

    if (rating === "again") {
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (rating === "hard") {
      newInterval = Math.max(1, Math.floor(newInterval * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
    } else if (rating === "good") {
      newInterval = Math.max(1, Math.floor(newInterval * newEase));
    } else if (rating === "easy") {
      newInterval = Math.max(1, Math.floor(newInterval * newEase * 1.3));
      newEase += 0.15;
    }

    const nextReview = new Date();
    nextReview.setDate(now.getDate() + newInterval);

    await prisma.flashcard.update({
      where: { id },
      data: {
        interval: newInterval,
        easeFactor: newEase,
        nextReview,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update flashcard progress:");
    return { success: false, error: "Failed to update progress" };
  }
}

export async function deleteFlashcard(id: string): Promise<{ success: boolean; error?: string }> {
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

    await prisma.flashcard.delete({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete flashcard:");
    return { success: false, error: "Failed to delete flashcard" };
  }
}

export async function createFlashcard(
  front: string,
  back: string,
  context?: string,
  tense?: string,
  phonetic?: string
): Promise<FlashcardResponse> {
  return saveFlashcard({ front, back, context, tense, phonetic });
}
