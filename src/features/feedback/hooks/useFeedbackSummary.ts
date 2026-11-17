import { useQuery } from "@tanstack/react-query";
import { generateFeedbackSummary } from "../controller/client";

/**
 * Hook to fetch or generate a feedback summary for a chat
 */
export function useFeedbackSummary(chatId?: string, userMessages?: string[]) {
  return useQuery({
    queryKey: ["feedback-summary", chatId, userMessages?.length],
    queryFn: async (): Promise<string> => {
      const result = await generateFeedbackSummary(chatId, userMessages);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch summary");
      }
      return result.summary || "No feedback available.";
    },
    enabled: !!(chatId || (userMessages && userMessages.length > 0)),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
