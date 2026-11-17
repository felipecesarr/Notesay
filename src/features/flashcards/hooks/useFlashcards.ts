import { useQuery } from "@tanstack/react-query";
import { getFlashcards } from "@/features/flashcards/controller";
import type { Flashcard } from "@/features/flashcards/controller/types";


const EMPTY_FLASHCARDS: Flashcard[] = [];

export function useFlashcards() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async (): Promise<Flashcard[]> => {
      const result = await getFlashcards();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch flashcards");
      }
      return result.flashcards || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    flashcards: data || EMPTY_FLASHCARDS,
    isLoading,
    refetchFlashcards: refetch
  };
}
