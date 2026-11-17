import { useQuery } from "@tanstack/react-query";
import { getYouTubeStudies } from "@/features/youtube-study/controller";
import { getProgress, type ProgressMap } from "@/features/read-aloud/controller";
import type { YouTubeStudy } from "@prisma/client";

export interface StudiesData {
  studies: YouTubeStudy[];
  studyProgress: Record<string, ProgressMap>;
}

const EMPTY_STUDIES: YouTubeStudy[] = [];
const EMPTY_PROGRESS: Record<string, ProgressMap> = {};

export function useYouTubeStudies() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["youtube-studies"],
    queryFn: async (): Promise<StudiesData> => {
      // 1. Fetch Studies List
      const result = await getYouTubeStudies();
      if (!result.success || !result.studies) {
        throw new Error(result.error || "Failed to fetch studies");
      }

      const studies = result.studies;

      // 2. Fetch Progress for each study in parallel
      const progressPromises = studies.map(async (study) => {
        const progResult = await getProgress(study.id);
        return {
          id: study.id,
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
        studies,
        studyProgress: progressMap
      };
    },
    // Cache configuration: 2 minutes stale
    staleTime: 2 * 60 * 1000, 
    refetchOnWindowFocus: true,
  });

  return {
    studies: data?.studies || EMPTY_STUDIES,
    studyProgress: data?.studyProgress || EMPTY_PROGRESS,
    isLoading,
    refetch,
  };
}
