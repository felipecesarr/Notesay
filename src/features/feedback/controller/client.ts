"use client";

/**
 * CLIENT-SIDE CONTROLLER - Feedback Feature
 * Client-side wrappers for feedback operations
 */

import type { Feedback } from "../procedure";

export type { Feedback };

/**
 * Get feedback by ID (client-side)
 */
export async function getFeedbackById(
  feedbackId: string
): Promise<{ success: boolean; feedback?: Feedback; error?: string }> {
  try {
    // Import the server action dynamically
    const { getFeedbackByIdServer } = await import('./server');
    return await getFeedbackByIdServer(feedbackId);
  } catch (error) {
    console.error("Error fetching feedback:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch feedback",
    };
  }
}

/**
 * Generate feedback summary (client-side)
 */
export async function generateFeedbackSummary(chatId?: string, userMessages?: string[]): Promise<{ success: boolean; summary?: string; error?: string }> {
    try {
        const { generateFeedbackSummary } = await import('./server');
        return await generateFeedbackSummary(chatId, userMessages);
    } catch (error) {
        console.error("Error generating feedback summary:");
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate summary",
        };
    }
}
