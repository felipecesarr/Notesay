"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  trackTokenUsage,
  extractTokenMetadata
} from "@/meetmate/services/token-tracking";

/**
 * GEMINI FILE SEARCH SERVICE
 *
 * This service provides RAG (Retrieval Augmented Generation) capabilities
 * using Google's Gemini File Search API.
 *
 * Use cases:
 * - Index YouTube transcripts for semantic search
 * - Ask questions about video content
 * - Quiz mode: AI asks questions based on indexed content
 */

export interface FileSearchStore {
  name: string;
  displayName: string;
  createTime?: string;
  updateTime?: string;
}

export interface FileSearchFile {
  name: string;
  displayName: string;
  mimeType?: string;
  sizeBytes?: string;
  createTime?: string;
  updateTime?: string;
  state?: string;
}

export interface UploadToStoreResult {
  success: boolean;
  file?: FileSearchFile;
  error?: string;
  operationName?: string;
}

export interface QueryResult {
  success: boolean;
  response?: string;
  citations?: Array<{
    fileName: string;
    snippet: string;
  }>;
  error?: string;
}

/**
 * Create a File Search store to hold indexed documents
 */
export async function createFileSearchStore(
  displayName: string
): Promise<{ success: boolean; store?: FileSearchStore; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Gemini API key not configured" };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create store: ${error}` };
    }

    const store = await response.json();
    return {
      success: true,
      store: {
        name: store.name,
        displayName: store.displayName,
        createTime: store.createTime,
        updateTime: store.updateTime,
      },
    };
  } catch (error) {
    console.error("Error creating File Search store:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get or create the default File Search store for the application
 */
export async function getOrCreateDefaultStore(): Promise<{
  success: boolean;
  store?: FileSearchStore;
  error?: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Gemini API key not configured" };
  }

  try {
    // List existing stores
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${apiKey}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to list stores" };
    }

    const data = await response.json();
    const stores = data.fileSearchStores || [];

    // Look for existing store with our app name
    const existingStore = stores.find(
      (s: { displayName: string; name: string; createTime: string; updateTime: string }) =>
        s.displayName === "MeetMate Learning Store"
    );

    if (existingStore) {
      return {
        success: true,
        store: {
          name: existingStore.name,
          displayName: existingStore.displayName,
          createTime: existingStore.createTime,
          updateTime: existingStore.updateTime,
        },
      };
    }

    // Create new store if not found
    return await createFileSearchStore("MeetMate Learning Store");
  } catch (error) {
    console.error("Error getting/creating default store:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Upload text content directly to File Search store
 * Used for YouTube transcripts and AI-generated texts
 */
export async function uploadTextToStore(
  storeName: string,
  displayName: string,
  textContent: string
): Promise<UploadToStoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Gemini API key not configured" };
  }

  try {
    // Convert text to blob
    const blob = new Blob([textContent], { type: "text/plain" });
    const numBytes = blob.size;

    // Initiate resumable upload
    const initResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/${storeName}:uploadToFileSearchStore?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": numBytes.toString(),
          "X-Goog-Upload-Header-Content-Type": "text/plain",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
        }),
      }
    );

    const uploadUrl = initResponse.headers.get("x-goog-upload-url");
    if (!uploadUrl) {
      return { success: false, error: "Failed to get upload URL" };
    }

    // Upload the actual content
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": numBytes.toString(),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      return { success: false, error: `Upload failed: ${error}` };
    }

    const result = await uploadResponse.json();

    return {
      success: true,
      file: {
        name: result.file?.name || "",
        displayName: result.file?.displayName || displayName,
        mimeType: result.file?.mimeType,
        sizeBytes: result.file?.sizeBytes,
        createTime: result.file?.createTime,
        state: result.file?.state,
      },
      operationName: result.name,
    };
  } catch (error) {
    console.error("Error uploading text to store:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Query the File Search store with a question
 * Returns AI-generated response with citations
 */
export async function queryFileSearchStore(
  storeName: string,
  question: string,
  systemPrompt?: string,
  userId?: string
): Promise<QueryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Gemini API key not configured" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Build the prompt
    let fullPrompt = question;
    if (systemPrompt) {
      fullPrompt = `${systemPrompt}\n\nUser question: ${question}`;
    }

    // Generate content with File Search tool
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      tools: [
        {
          // @ts-expect-error - fileSearch types not yet fully stable in this version
          fileSearch: {
            fileSearchStoreNames: [storeName],
          },
        },
      ],
    });

    // Track token usage
    if (userId) {
      const tokens = extractTokenMetadata(result);
      trackTokenUsage({
        userId,
        feature: 'file-search',
        action: 'queryFileSearchStore',
        model: 'gemini-2.5-flash',
        ...tokens,
      });
    }

    const response = await result.response;
    const text = response.text();

    // Extract citations if available
    const citations: Array<{ fileName: string; snippet: string }> = [];
    // Note: Citation extraction would need to be implemented based on response structure

    return {
      success: true,
      response: text,
      citations,
    };
  } catch (error) {
    console.error("Error querying File Search store:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate quiz questions based on indexed content
 * In quiz mode, AI asks questions about the sources
 */
export async function generateQuizQuestion(
  storeName: string,
  previousQuestions: string[],
  userContext?: string
): Promise<{ success: boolean; question?: string; error?: string }> {
  const systemPrompt = `You are a helpful English teacher in quiz mode. Your role is to ask questions about the content the user is studying to help them learn.

BEHAVIOR:
- Ask ONE clear, specific question at a time about the content
- Make questions that test understanding, not just memorization
- Keep questions concise and clear (max 30 words)
- Vary question types: comprehension, analysis, application
- Build on previous questions to deepen understanding
- Be encouraging and supportive

Previous questions you've asked:
${previousQuestions.join("\n")}

${userContext ? `User's recent response: ${userContext}` : "This is the first question."}

Generate a new question about the content that helps the user learn.`;

  const prompt = userContext
    ? `Based on my previous answer, what's your next question about the content?`
    : `Ask me a question about the content to help me learn.`;

  const result = await queryFileSearchStore(storeName, prompt, systemPrompt);

  if (result.success && result.response) {
    return {
      success: true,
      question: result.response,
    };
  }

  return {
    success: false,
    error: result.error || "Failed to generate question",
  };
}

/**
 * Delete a file from the File Search store
 */
export async function deleteFileFromStore(
  storeName: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "Gemini API key not configured" };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${storeName}/files/${fileName}?key=${apiKey}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete file: ${error}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting file from store:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
