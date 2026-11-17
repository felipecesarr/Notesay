import { useQuery } from "@tanstack/react-query";
import { getNotes, type Note } from "@/features/notes/controller";


const EMPTY_NOTES: Note[] = [];

export function useNotes() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notes"],
    queryFn: async (): Promise<Note[]> => {
      const result = await getNotes();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch notes");
      }
      return result.notes || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });

  return {
    notes: data || EMPTY_NOTES,
    isLoading,
    refetchNotes: refetch
  };
}
