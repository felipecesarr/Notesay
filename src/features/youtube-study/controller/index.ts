"use server";

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import { extractYouTubeVideoId, normalizeYouTubeUrl, getYouTubeThumbnail } from "../procedure";
import { extractTranscript } from "../services/transcript-extractor";
import { z } from "zod";
import type { YouTubeStudy } from "@prisma/client";
import {
  getOrCreateDefaultStore,
  uploadTextToStore,
} from "@/meetmate/services/ai/gemini-file-search";
import {
  trackTokenUsage,
  extractTokenMetadata,
} from "@/meetmate/services/token-tracking";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type { YouTubeStudy };

// Zod validation schemas
const processVideoSchema = z.object({
  url: z.string().url("Invalid URL format").refine(
    (url) => !!extractYouTubeVideoId(url),
    "Must be a valid YouTube URL"
  ),
});

const deleteStudySchema = z.object({
  id: z.string().cuid("Invalid study ID"),
});

export async function processYouTubeVideo(videoUrl: string) {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // 3. Validation
    const validation = processVideoSchema.safeParse({ url: videoUrl });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const normalizedUrl = normalizeYouTubeUrl(videoUrl);
    if (!normalizedUrl) {
      return { success: false, error: "Could not normalize URL" };
    }

    const videoId = extractYouTubeVideoId(normalizedUrl);
    if (!videoId) {
      return { success: false, error: "Could not extract video ID" };
    }

    // 3. Check if already exists
    const existing = await prisma.youTubeStudy.findFirst({
      where: {
        userId: session.user.id,
        videoUrl: normalizedUrl,
      },
    });

    if (existing) {
      return { success: true, study: existing };
    }

    // 4. Extract transcript with fallback (Supadata -> youtube-caption-extractor)
    void 0;

    const transcriptResult = await extractTranscript(normalizedUrl, videoId);

    if (!transcriptResult.success) {
      console.error("Transcript extraction failed:");
      return {
        success: false,
        error: transcriptResult.error || "Failed to extract transcript. The video may not have captions available."
      };
    }

    const extractedContent = transcriptResult.content!;
    let summary = "";
    let title = "YouTube Video Study";

    // 5. Extract metadata from transcript using Gemini
    try {
      const transcriptSample = extractedContent.slice(0, 4000);

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const metadataResult = await model.generateContent([
        `Based on this YouTube video transcript excerpt, extract metadata in JSON format:

         Transcript excerpt:
         ${transcriptSample}

         Extract:
         1. "title": Infer the video title from the content
         2. "summary": A concise summary (2-3 sentences)

         Return ONLY the JSON object.`
      ]).catch(err => {
        console.error("Gemini metadata extraction error:");
        return null;
      });

      if (metadataResult) {
        // Track token usage for metadata extraction
        const tokens = extractTokenMetadata(metadataResult);
        trackTokenUsage({
          userId: session.user.id,
          feature: 'youtube-study',
          action: 'extractMetadata',
          model: 'gemini-2.5-flash',
          ...tokens,
        });

        const text = metadataResult.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const metadata = JSON.parse(cleanJson);

        if (metadata.title) title = metadata.title;
        if (metadata.summary) summary = metadata.summary;
      } else {
        summary = `Transcript extracted from YouTube video (${transcriptResult.language || "unknown"})`;
      }
    } catch (e) {
      console.error("Failed to extract metadata:");
      summary = `Transcript extracted from YouTube video (${transcriptResult.language || "unknown"})`;
    }

    // 4.5 Refinement skipped for speed
    void 0;

    // 5. Save to DB
    const study = await prisma.youTubeStudy.create({
      data: {
        userId: session.user.id,
        videoUrl: normalizedUrl,
        title: title,
        thumbnail: getYouTubeThumbnail(videoId),
        extractedContent: extractedContent,
        summary: summary,
      },
    });

    // 6. Upload transcript to File Search store
    try {
      const storeResult = await getOrCreateDefaultStore();
      if (storeResult.success && storeResult.store) {
        await uploadTextToStore(
          storeResult.store.name,
          `${title} (${videoId})`,
          extractedContent
        );
      }
    } catch (fileSearchError) {
      console.error("Error uploading to File Search store:");
    }

    return { success: true, study };

  } catch (error) {
    console.error("Error processing YouTube video:");
    return { success: false, error: "Failed to process video" };
  }
}

export async function getYouTubeStudies() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const studies = await prisma.youTubeStudy.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, studies };
  } catch (error) {
    console.error("Error fetching studies:");
    return { success: false, error: "Failed to fetch studies" };
  }
}

export async function deleteYouTubeStudy(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const validation = deleteStudySchema.safeParse({ id });
    if (!validation.success) {
      return { success: false, error: "Invalid ID" };
    }

    await prisma.youTubeStudy.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting study:");
    return { success: false, error: "Failed to delete study" };
  }
}

export async function getYouTubeSuggestions(topic?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized", suggestions: [] };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required", suggestions: [] };
    }

    interface YouTubeSuggestion {
      videoId: string;
      title: string;
      thumbnail: string;
      channelTitle: string;
      url: string;
    }

    let suggestions: YouTubeSuggestion[] = [];

    // Fetch videos based on selected topic from YouTube Data API
    try {
      const apiKey = process.env.YOUTUBE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!apiKey) {
        console.warn("No YouTube API key found");
        throw new Error("No API key available");
      }

      // Build search query focused on the topic itself
      const searchQuery = topic || 'popular trending videos';

      void 0;

      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=20&order=relevance&videoDuration=medium&relevanceLanguage=en&videoDefinition=high&key=${apiKey}`,
        {
          headers: { "Accept": "application/json" },
          cache: "no-store", // Prevent caching to ensure fresh results
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("Notesay operation failed.");
        throw new Error(`YouTube API returned ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      if (searchData.error) {
        console.error("YouTube API error details:");
        throw new Error(searchData.error.message || "YouTube API error");
      }

      if (searchData.items && searchData.items.length > 0) {
        void 0;

        const shuffled = searchData.items.sort(() => Math.random() - 0.5);
        suggestions = shuffled.slice(0, 10).map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { medium?: { url: string } } } }) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
          channelTitle: item.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
      } else {
        console.warn("Notesay operation requires attention.");
      }
    } catch (err) {
      console.error("Error fetching videos from YouTube API:");
    }

    // Fallback: Curated videos if API fails
    if (suggestions.length === 0) {
      const videoPool = [
        { videoId: "8S0FDjFBj8o", title: "Your body language may shape who you are | Amy Cuddy", channelTitle: "TED" },
        { videoId: "Ks-_Mh1QhMc", title: "Your elusive creative genius | Elizabeth Gilbert", channelTitle: "TED" },
        { videoId: "iCvmsMzlF7o", title: "Do schools kill creativity? | Sir Ken Robinson", channelTitle: "TED" },
        { videoId: "arj7oStGLkU", title: "The power of vulnerability | Brené Brown", channelTitle: "TED" },
        { videoId: "RjwT5fC5xVo", title: "The happy secret to better work | Shawn Achor", channelTitle: "TED" },
        { videoId: "xuCn8ux2gbs", title: "History of the Entire World", channelTitle: "bill wurtz" },
        { videoId: "PMotykw0SIk", title: "Steve Jobs Stanford Speech", channelTitle: "Stanford" },
        { videoId: "UF8uR6Z6KLc", title: "Steve Jobs iPhone Launch", channelTitle: "Apple" },
      ];

      const shuffled = videoPool.sort(() => Math.random() - 0.5);
      suggestions = shuffled.slice(0, 10).map(video => ({
        videoId: video.videoId,
        title: video.title,
        thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
        channelTitle: video.channelTitle,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
      }));
    }

    return { success: true, suggestions };
  } catch (error) {
    console.error("Error fetching YouTube suggestions:");
    return { success: false, error: "Failed to fetch suggestions", suggestions: [] };
  }
}
