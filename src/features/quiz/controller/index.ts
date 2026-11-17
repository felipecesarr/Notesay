"use server";

/**
 * CONTROLLER LAYER - Quiz Feature
 * Handles I/O operations for quiz functionality
 * Coordinates between procedure layer and external services
 */

import {
  getOrCreateDefaultStore,
  queryFileSearchStore,
  generateQuizQuestion as generateQuizQuestionService,
} from "@/meetmate/services/ai/gemini-file-search";
import {
  buildFeedbackPrompt,
  validateQuizQuestion,
  type QuizSession,
} from "../procedure";
import { generateChatResponse } from "@/meetmate/services/ai/gemini";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";

export interface GenerateQuizQuestionInput {
  sourceIds: string[];
  sourceNames: string[];
  previousQuestions: string[];
  userPreviousAnswer?: string;
}

export interface GenerateQuizQuestionResult {
  success: boolean;
  question?: string;
  error?: string;
}

/**
 * Generate a quiz question based on selected sources
 */
export async function generateQuizQuestion(
  input: GenerateQuizQuestionInput
): Promise<GenerateQuizQuestionResult> {
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

    // Get the default File Search store
    const storeResult = await getOrCreateDefaultStore();

    if (!storeResult.success || !storeResult.store) {
      return {
        success: false,
        error: storeResult.error || "Failed to get File Search store",
      };
    }


    // Generate question using File Search
    const result = await generateQuizQuestionService(
      storeResult.store.name,
      input.previousQuestions,
      input.userPreviousAnswer
    );

    if (!result.success || !result.question) {
      return {
        success: false,
        error: result.error || "Failed to generate question",
      };
    }

    // Validate question
    const validation = validateQuizQuestion(result.question);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      question: result.question,
    };
  } catch (error) {
    console.error("Error generating quiz question:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export interface AnswerQuizQuestionInput {
  storeName: string;
  question: string;
  answer: string;
  sourceNames: string[];
}

export interface AnswerQuizQuestionResult {
  success: boolean;
  feedback?: string;
  nextQuestion?: string;
  error?: string;
}

/**
 * Process user's answer and optionally generate next question
 */
export async function answerQuizQuestion(
  input: AnswerQuizQuestionInput
): Promise<AnswerQuizQuestionResult> {
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

    // Query File Search with the answer to get AI feedback
    const systemPrompt = `You are a supportive English teacher. The student just answered a question about the content.

Question: ${input.question}
Student's answer: ${input.answer}

Provide brief, encouraging feedback on their answer (2-3 sentences). If correct, praise them. If incomplete, gently guide them to think deeper.`;

    const result = await queryFileSearchStore(
      input.storeName,
      input.answer,
      systemPrompt
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to process answer",
      };
    }

    return {
      success: true,
      feedback: result.response,
    };
  } catch (error) {
    console.error("Error processing quiz answer:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export interface GenerateQuizFeedbackInput {
  session: QuizSession;
}

export interface GenerateQuizFeedbackResult {
  success: boolean;
  feedback?: {
    overallPerformance: string;
    strengths: string[];
    areasToImprove: string[];
    nextSteps: string;
    encouragement: string;
  };
  error?: string;
}

/**
 * Generate comprehensive feedback for a quiz session
 */
export async function generateQuizFeedback(
  input: GenerateQuizFeedbackInput
): Promise<GenerateQuizFeedbackResult> {
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

    const feedbackPrompt = buildFeedbackPrompt(input.session);

    const result = await generateChatResponse(
      "You are an expert educator providing constructive feedback.",
      feedbackPrompt,
      0.7
    );

    // Parse JSON response
    const cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();
    const feedback = JSON.parse(cleanJson);

    return {
      success: true,
      feedback,
    };
  } catch (error) {
    console.error("Error generating quiz feedback:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get File Search store name for quiz operations
 */
export async function getQuizStoreName(): Promise<{
  success: boolean;
  storeName?: string;
  error?: string;
}> {
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

    const result = await getOrCreateDefaultStore();

    if (!result.success || !result.store) {
      return {
        success: false,
        error: result.error || "Failed to get store",
      };
    }

    return {
      success: true,
      storeName: result.store.name,
    };
  } catch (error) {
    console.error("Error getting quiz store name:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
