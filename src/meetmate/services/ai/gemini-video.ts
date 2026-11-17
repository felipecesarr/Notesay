"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  trackTokenUsage,
  extractTokenMetadata
} from "@/meetmate/services/token-tracking";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Represents a video understanding response from Gemini
 */
export interface VideoUnderstandingResponse {
  success: boolean;
  response?: string;
  error?: string;
}

/**
 * Sends a question about a YouTube video to Gemini's Video Understanding API
 *
 * @param videoUrl - Full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
 * @param question - User's question about the video
 * @param previousMessages - Chat history for context
 * @param isQuizMode - Whether this is quiz mode (more analytical) or conversation mode
 * @returns VideoUnderstandingResponse with the AI's answer
 */
export async function sendVideoQuestion(
  videoUrl: string,
  question: string,
  previousMessages: Array<{ role: string; content: string }> = [],
  isQuizMode: boolean = false,
  userId?: string
): Promise<VideoUnderstandingResponse> {
  try {
    // Validate YouTube URL
    if (!videoUrl.includes("youtube.com/watch?v=") && !videoUrl.includes("youtu.be/")) {
      return {
        success: false,
        error: "Invalid YouTube URL format",
      };
    }

    // Initialize the model for video understanding
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Build system instruction based on mode
    const systemInstruction = isQuizMode
      ? `You are an English tutor helping a language learner practice English through conversation about video content they're interested in.

         🎯 PRIMARY GOAL: Help the user practice and improve their English using this video as a conversation topic.

         🎯 CRITICAL INSTRUCTION - SOURCE FOCUS:
         You MUST discuss STRICTLY THIS SPECIFIC video that the user has selected in their CURRENT message.
         DO NOT reference or discuss any other videos or sources from previous messages.
         The user may change which video they're asking about, so ALWAYS focus on the video attached to their CURRENT question.

         📚 ENGLISH TUTOR MODE INSTRUCTIONS:
         - Your goal is to help them PRACTICE ENGLISH, not test their knowledge of the video content
         - Ask ONLY ONE question at a time that makes them use English to respond
         - Questions should encourage them to use vocabulary, expressions, and phrases from the video
         - Example: "How would you describe the main idea from **2:15** in your own words?" or "What expression did they use for **X**? Can you use it in a sentence?"
         - Focus on making them write/speak in English about topics they enjoy
         - When they respond, acknowledge their English usage warmly
         - Keep the conversation natural and encouraging
         - Use the video as a springboard for English practice, not as a quiz topic
         - Format using markdown for readability
         - CRITICAL: DO NOT provide grammar corrections or English feedback in your responses - this is handled by a separate feedback system

         Remember: You're helping them practice English as a language, not testing their comprehension of the video!`
      : `You are an American friend having a casual, natural conversation with a language learner about videos they're watching.

         🎯 PRIMARY GOAL: Help them practice real-world English conversation about topics they enjoy.

         🎯 CRITICAL INSTRUCTION - SOURCE FOCUS:
         You MUST discuss STRICTLY THIS SPECIFIC video that the user has selected in their CURRENT message.
         DO NOT reference or discuss any other videos or sources from previous messages.
         The user may change which video they're asking about, so ALWAYS focus on the video attached to their CURRENT question.

         👥 AMERICAN FRIEND MODE INSTRUCTIONS:
         - Talk like a friendly American having a casual conversation
         - Use natural expressions, idioms, and slang that native speakers use
         - React authentically to their messages (e.g., "Oh that's interesting!" "I see what you mean!")
         - Share your thoughts about the video topic in a conversational way
         - Help them practice vocabulary and phrases from the video naturally in conversation
         - Keep responses conversational - typically 2-4 sentences
         - Be encouraging and make them feel comfortable practicing English
         - Use the video as a conversation starter, not as formal content to discuss
         - Format using markdown for readability
         - CRITICAL: DO NOT provide grammar corrections, "you could say it this way" tips, or English feedback in your responses - this is handled by a separate feedback system

         Remember: You're a friend helping them practice English through natural conversation, not a teacher or assistant!`;

    // Build conversation history
    const conversationHistory = previousMessages
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n\n");

    // Build the full prompt
    const fullPrompt = `${systemInstruction}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}Current question: ${question}`;

    // Generate content with YouTube video URL
    const result = await model.generateContent([
      fullPrompt,
      {
        fileData: {
          fileUri: videoUrl,
          mimeType: "video/mp4", // YouTube videos are typically mp4
        },
      },
    ]);

    // Track token usage
    if (userId) {
      const tokens = extractTokenMetadata(result);
      trackTokenUsage({
        userId,
        feature: 'video-understanding',
        action: isQuizMode ? 'sendVideoQuestionQuiz' : 'sendVideoQuestion',
        model: 'gemini-2.5-flash',
        ...tokens,
      });
    }

    const response = result.response;
    const text = response.text();

    return {
      success: true,
      response: text,
    };
  } catch (error) {
    console.error("Error in sendVideoQuestion:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process video question",
    };
  }
}

/**
 * Generates a quiz question based on video content
 *
 * @param videoUrl - Full YouTube URL
 * @param topic - Optional topic focus for the question
 * @param userId - Optional user ID for token tracking
 * @returns VideoUnderstandingResponse with a quiz question
 */
export async function generateVideoQuizQuestion(
  videoUrl: string,
  topic?: string,
  userId?: string
): Promise<VideoUnderstandingResponse> {
  try {
    if (!videoUrl.includes("youtube.com/watch?v=") && !videoUrl.includes("youtu.be/")) {
      return {
        success: false,
        error: "Invalid YouTube URL format",
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = topic
      ? `Based on this video, generate a thoughtful quiz question about: ${topic}.

         Requirements:
         - Create a clear, focused question testing key concepts
         - Provide a concise correct answer (1-2 sentences)
         - Include brief explanation with timestamp (MM:SS)
         - Keep explanation short and to the point

         Format: Question | Correct Answer | Explanation with timestamp`
      : `Based on this video, generate a thoughtful quiz question that tests understanding of a key concept.

         Requirements:
         - Create a clear, focused question
         - Provide a concise correct answer (1-2 sentences)
         - Include brief explanation with timestamp (MM:SS)
         - Keep explanation short and to the point

         Format: Question | Correct Answer | Explanation with timestamp`;

    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: videoUrl,
          mimeType: "video/mp4", // YouTube videos are typically mp4
        },
      },
    ]);

    // Track token usage
    if (userId) {
      const tokens = extractTokenMetadata(result);
      trackTokenUsage({
        userId,
        feature: 'video-understanding',
        action: 'generateVideoQuizQuestion',
        model: 'gemini-2.5-flash',
        ...tokens,
      });
    }

    const response = result.response;
    const text = response.text();

    return {
      success: true,
      response: text,
    };
  } catch (error) {
    console.error("Error in generateVideoQuizQuestion:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate quiz question",
    };
  }
}
