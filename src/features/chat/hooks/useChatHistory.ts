import { useQuery } from "@tanstack/react-query";
import { getChatConversations } from "@/features/chat/controller";
import type { ChatConversation } from "@/features/chat/procedure";

export function useChatHistory() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["chat-history"],
    queryFn: async (): Promise<ChatConversation[]> => {
      const result = await getChatConversations();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch chat history");
      }
      return result.chats || [];
    },
    // Cache configuration for 100k users
    // Keep data fresh for 1 minute, but cache in background
    staleTime: 60 * 1000, 
    refetchOnWindowFocus: true,
  });

  return {
    savedChats: data || [],
    isLoading,
    refetchChats: refetch
  };
}
