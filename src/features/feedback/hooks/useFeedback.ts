import { useQuery } from "@tanstack/react-query";
import { getFeedbackById } from "../controller/client";
import type { Feedback } from "../procedure";

/**
 * Hook to fetch a single feedback by ID
 */
export function useFeedback(feedbackId: string | undefined) {
  return useQuery({
    queryKey: ["feedback", feedbackId],
    queryFn: async (): Promise<Feedback | null> => {
      if (!feedbackId) return null;
      const result = await getFeedbackById(feedbackId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch feedback");
      }
      return (result.feedback as Feedback) || null;
    },
    enabled: !!feedbackId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
