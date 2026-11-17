"use server";

import { generateInterviewQuestion, enhanceSystemPrompt } from "@/meetmate/services/ai/gemini";
import type { AIConfig } from "@/meetmate/services/ai/gemini";
import { buildSystemPrompt } from "../procedure";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";

/**
 * CONTROLLER LAYER - Interview Feature
 * Handles all I/O with AI service for interview sessions
 * No business logic - only I/O operations
 */

// Generate next question based on conversation
export async function generateNextQuestion(
  transcript: string,
  previousQuestions: string[],
  config: AIConfig
): Promise<{ success: boolean; question?: string; error?: string }> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const question = await generateInterviewQuestion(transcript, previousQuestions, config, undefined, session.user.id);

    if (!question) {
      return { success: false, error: "AI returned empty response" };
    }

    return { success: true, question };
  } catch (error) {
    console.error("Failed to generate question:");
    return { success: false, error: "Failed to generate question" };
  }
}

// Enhance a system prompt using AI
export async function enhancePrompt(
  prompt: string
): Promise<{ success: boolean; enhancedPrompt?: string; error?: string }> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    if (!prompt || prompt.trim().length < 20) {
      return { success: false, error: "Prompt too short to enhance" };
    }

    const enhanced = await enhanceSystemPrompt(prompt, session.user.id);

    if (!enhanced || enhanced === prompt) {
      return { success: false, error: "Enhancement did not improve prompt" };
    }

    return { success: true, enhancedPrompt: enhanced };
  } catch (error) {
    console.error("Failed to enhance prompt:");
    return { success: false, error: "Failed to enhance prompt" };
  }
}

// Generate initial greeting based on skill
export async function generateGreeting(
  config: AIConfig
): Promise<{ success: boolean; greeting?: string; error?: string }> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const systemPrompt = buildSystemPrompt(config.skill, config, config.customPrompt);
    const context = "This is the start of a new conversation. Greet the user and ask your first question.";

    const greeting = await generateInterviewQuestion(context, [], {
      ...config,
      customPrompt: systemPrompt,
    }, undefined, session.user.id);

    if (!greeting) {
      return { success: false, error: "Failed to generate greeting" };
    }

    return { success: true, greeting };
  } catch (error) {
    console.error("Failed to generate greeting:");
    return { success: false, error: "Failed to generate greeting" };
  }
}

// Batch generate multiple questions (for caching/preparation)
export async function generateQuestionBatch(
  transcript: string,
  previousQuestions: string[],
  config: AIConfig,
  count: number = 3
): Promise<{ success: boolean; questions?: string[]; error?: string }> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const questions: string[] = [];

    for (let i = 0; i < count; i++) {
      const question = await generateInterviewQuestion(
        transcript,
        [...previousQuestions, ...questions],
        config,
        undefined,
        session.user.id
      );

      if (question) {
        questions.push(question);
      }
    }

    if (questions.length === 0) {
      return { success: false, error: "Failed to generate any questions" };
    }

    return { success: true, questions };
  } catch (error) {
    console.error("Failed to generate question batch:");
    return { success: false, error: "Failed to generate questions" };
  }
}
