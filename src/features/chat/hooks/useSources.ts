import { useMemo } from "react";
import { useYouTubeStudies } from "@/features/youtube-study/hooks/useYouTubeStudies";
import { usePracticeTexts } from "@/features/read-aloud/hooks/usePracticeTexts";
import { usePDFStudies } from "@/features/pdf-study/hooks/usePDFStudies";

export interface Source {
  id: string;
  title: string;
  type: "youtube" | "text" | "pdf";
  videoId?: string;
  videoUrl?: string;
  thumbnail?: string;
  content?: string;
}

export function useSources() {
  const { studies, isLoading: isLoadingStudies, refetch: refetchStudies } = useYouTubeStudies();
  const { texts, isLoading: isLoadingTexts, refetchPracticeTexts: refetchTexts } = usePracticeTexts();
  const { studies: pdfStudies, isLoading: isLoadingPDFs, refetch: refetchPDFs } = usePDFStudies();

  const sources = useMemo(() => {
    const combined: Source[] = [];

    // Add YouTube videos
    combined.push(...studies.map(study => {
      // Extract video ID from URL
      const videoId = study.videoUrl.includes('v=')
        ? study.videoUrl.split('v=')[1].split('&')[0]
        : undefined;

      return {
        id: study.id,
        title: study.title,
        type: "youtube" as const,
        videoId,
        videoUrl: study.videoUrl,
        thumbnail: study.thumbnail || undefined,
        content: study.extractedContent, 
      };
    }));

    // Add PDF Studies
    combined.push(...pdfStudies.map(pdf => ({
      id: pdf.id,
      title: pdf.title || pdf.fileName,
      type: "pdf" as const,
      content: pdf.extractedContent || undefined,
    })));

    // Add AI Texts
    combined.push(...texts.map(text => ({
      id: text.id,
      title: text.title,
      type: "text" as const,
      content: text.content,
    })));

    return combined;
  }, [studies, texts, pdfStudies]);

  const refreshSources = () => {
    refetchStudies();
    refetchTexts();
    refetchPDFs();
  };

  return {
    sources,
    isLoading: isLoadingStudies || isLoadingTexts || isLoadingPDFs,
    refreshSources,
  };
}
