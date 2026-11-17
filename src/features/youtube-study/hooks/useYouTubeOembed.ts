import { useQuery } from "@tanstack/react-query";

interface OEmbedData {
  title: string;
  author_name: string;
  thumbnail_url?: string;
}

export function useYouTubeOembed(videoId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["youtube-oembed", videoId],
    queryFn: async (): Promise<OEmbedData> => {
      if (!videoId) throw new Error("No video ID");
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          videoUrl
        )}&format=json`
      );
      if (!res.ok) throw new Error("Failed to fetch oEmbed data");
      return res.json();
    },
    enabled: !!videoId,
    staleTime: 60 * 60 * 1000, // 1 hour cache
    retry: false,
  });

  return {
    data,
    isLoading,
    error
  };
}
