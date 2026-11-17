"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import {
  trackTokenUsage,
  extractTokenMetadata
} from "@/meetmate/services/token-tracking";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export async function processURL(url: string): Promise<string> {
  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verificar subscription
  const hasSubscription = await hasActiveSubscription();
  if (!hasSubscription) {
    throw new Error("Subscription required");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Extract and summarize the key information from this URL: ${url}.
          Focus on main topics, important facts, and context that would be useful for generating interview questions.`
        }]
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
    });

    // Track token usage
    const tokens = extractTokenMetadata(result);
    trackTokenUsage({
      userId: session.user.id,
      feature: 'context-processing',
      action: 'processURL',
      model: 'gemini-2.5-flash',
      ...tokens,
    });

    return result.response.text();
  } catch (error) {
    console.error("Error processing URL:");
    throw new Error("Failed to process URL");
  }
}

export async function processVideo(videoUrl: string): Promise<string> {
  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verificar subscription
  const hasSubscription = await hasActiveSubscription();
  if (!hasSubscription) {
    throw new Error("Subscription required");
  }

  try {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Analyze this YouTube video and extract key topics, main points, and important information that would be useful for generating interview questions. YouTube URL: ${videoUrl}`
        }]
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
    });

    // Track token usage
    const tokens = extractTokenMetadata(result);
    trackTokenUsage({
      userId: session.user.id,
      feature: 'context-processing',
      action: 'processVideo',
      model: 'gemini-2.5-flash',
      ...tokens,
    });

    return result.response.text();
  } catch (error) {
    console.error("Error processing video:");
    throw new Error("Failed to process video");
  }
}

export async function processPDF(fileUri: string): Promise<string> {
  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verificar subscription
  const hasSubscription = await hasActiveSubscription();
  if (!hasSubscription) {
    throw new Error("Subscription required");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: fileUri,
              mimeType: "application/pdf"
            }
          },
          {
            text: "Extract and summarize the key information from this PDF. Focus on main topics, important facts, and context that would be useful for generating interview questions."
          }
        ]
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
    });

    // Track token usage
    const tokens = extractTokenMetadata(result);
    trackTokenUsage({
      userId: session.user.id,
      feature: 'context-processing',
      action: 'processPDF',
      model: 'gemini-2.5-flash',
      ...tokens,
    });

    return result.response.text();
  } catch (error) {
    console.error("Error processing PDF:");
    throw new Error("Failed to process PDF");
  }
}

export async function generateAnswer(
  context: string,
  question: string,
  systemPrompt: string
): Promise<string> {
  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verificar subscription
  const hasSubscription = await hasActiveSubscription();
  if (!hasSubscription) {
    throw new Error("Subscription required");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const prompt = `Based on the following context, answer this question:

Question: ${question}

Context:
${context}

Provide a clear, detailed answer based on the context provided.`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    // Track token usage
    const tokens = extractTokenMetadata(result);
    trackTokenUsage({
      userId: session.user.id,
      feature: 'context-processing',
      action: 'generateAnswer',
      model: 'gemini-2.5-flash',
      ...tokens,
    });

    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating answer from context:");
    throw new Error("Failed to generate answer");
  }
}
