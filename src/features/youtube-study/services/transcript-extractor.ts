import { Supadata } from "@supadata/js";
import { getSubtitles } from "youtube-caption-extractor";

interface TranscriptResult {
  success: boolean;
  content?: string;
  language?: string;
  source?: "supadata" | "youtube-caption-extractor";
  error?: string;
}

interface TranscriptChunk {
  offset?: number;
  start?: number | string;
  dur?: number | string;
  text: string;
}

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY || "",
});

function formatTranscriptChunks(chunks: TranscriptChunk[]): string {
  return chunks
    .map((chunk) => {
      let seconds = 0;
      if (chunk.offset) {
        seconds = Math.floor(chunk.offset / 1000);
      } else if (chunk.start) {
        seconds = Math.floor(parseFloat(String(chunk.start)));
      }
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const timestamp = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      return `[${timestamp}] ${chunk.text}`;
    })
    .join(" ");
}

async function extractWithSupadata(videoUrl: string): Promise<TranscriptResult> {
  if (!process.env.SUPADATA_API_KEY) {
    return { success: false, error: "SUPADATA_API_KEY not configured" };
  }

  try {
    void 0;
    const result = await supadata.youtube.transcript({
      url: videoUrl,
      text: false,
    });

    if (Array.isArray(result.content) && result.content.length > 0) {
      return {
        success: true,
        content: formatTranscriptChunks(result.content),
        language: result.lang,
        source: "supadata",
      };
    }

    if (typeof result.content === "string" && result.content.length > 0) {
      return {
        success: true,
        content: result.content,
        language: result.lang,
        source: "supadata",
      };
    }

    return { success: false, error: "Empty transcript from Supadata" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supadata error";
    console.error("[Transcript] Supadata failed:");
    return { success: false, error: message };
  }
}

async function extractWithCaptionExtractor(videoId: string): Promise<TranscriptResult> {
  const languages = ["en", "pt", "es", "fr", "de", "it", "ja", "ko", "zh"];

  for (const lang of languages) {
    try {
      void 0;
      const subtitles = await getSubtitles({ videoID: videoId, lang });

      if (subtitles && subtitles.length > 0) {
        return {
          success: true,
          content: formatTranscriptChunks(subtitles),
          language: lang,
          source: "youtube-caption-extractor",
        };
      }
    } catch {
      void 0;
    }
  }

  return { success: false, error: "No captions available in any language" };
}

export async function extractTranscript(
  videoUrl: string,
  videoId: string
): Promise<TranscriptResult> {
  const supadataResult = await extractWithSupadata(videoUrl);
  if (supadataResult.success) {
    void 0;
    return supadataResult;
  }

  void 0;
  const extractorResult = await extractWithCaptionExtractor(videoId);
  if (extractorResult.success) {
    void 0;
    return extractorResult;
  }

  return {
    success: false,
    error: `Transcript extraction failed. The video may not have captions available.`,
  };
}
