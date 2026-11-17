import { useQuery } from "@tanstack/react-query";
import { getPDFStudies } from "../controller";
import { getProgress } from "@/features/read-aloud/controller";

interface PDFStudy {
  id: string;
  status?: string;
  [key: string]: unknown;
}

export function usePDFStudies() {
  const { data: studies = [], refetch, isLoading } = useQuery({
    queryKey: ['pdf-studies'],
    queryFn: async () => {
      const result = await getPDFStudies();
      return result.success && result.studies ? result.studies : [];
    },
    staleTime: 10000, // Consider data fresh for 10 seconds
    // Auto-refetch every 5 seconds ONLY if there are PENDING or PROCESSING studies
    refetchInterval: (query) => {
      const data = query.state.data as PDFStudy[] | undefined;
      if (!data || data.length === 0) return false;
      
      // Only poll if we explicitly have studies in processing state
      const hasProcessing = data.some(
        (s) => s.status === "PENDING" || s.status === "PROCESSING"
      );
      return hasProcessing ? 5000 : false;
    },
  });

  const { data: studyProgress = {} } = useQuery({
    queryKey: ['pdf-progress', studies.map((s: { id: string }) => s.id)],
    queryFn: async () => {
      const progressMap: Record<string, unknown> = {};
      
      // Parallel fetch for all studies
      await Promise.all(
        studies.map(async (study: { id: string }) => {
          const result = await getProgress(study.id);
          if (result.success && result.progress) {
            progressMap[study.id] = result.progress;
          }
        })
      );
      
      return progressMap;
    },
    enabled: studies.length > 0
  });

  return {
    studies,
    studyProgress,
    isLoading,
    refetch
  };
}

