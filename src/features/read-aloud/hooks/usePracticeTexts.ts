import { useQuery } from "@tanstack/react-query";
import { getPracticeTexts, getProgress, type PracticeText, type ProgressMap } from "@/features/read-aloud/controller";

export interface PracticeTextsData {
  texts: PracticeText[];
  textProgress: Record<string, ProgressMap>;
}

const EMPTY_TEXTS: PracticeText[] = [];
const EMPTY_PROGRESS: Record<string, ProgressMap> = {};

export function usePracticeTexts() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["practice-texts"],
    queryFn: async (): Promise<PracticeTextsData> => {
      // 1. Fetch Texts List
      const result = await getPracticeTexts();
      if (!result.success || !result.texts) {
        throw new Error(result.error || "Failed to fetch practice texts");
      }

      const texts = result.texts;

      // 2. Fetch Progress for each text in parallel
      const progressPromises = texts.map(async (text) => {
        const progResult = await getProgress(text.id);
        return {
          id: text.id,
          progress: (progResult.success && progResult.progress) ? progResult.progress : null
        };
      });

      const progressResults = await Promise.all(progressPromises);
      
      // 3. Construct Map
      const progressMap: Record<string, ProgressMap> = {};
      progressResults.forEach(({ id, progress }) => {
        if (progress) {
          progressMap[id] = progress;
        }
      });

      return {
        texts,
        textProgress: progressMap
      };
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: true,
  });

  return {
    texts: data?.texts || EMPTY_TEXTS,
    textProgress: data?.textProgress || EMPTY_PROGRESS,
    isLoading,
    refetchPracticeTexts: refetch
  };
}
