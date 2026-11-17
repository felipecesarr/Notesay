"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

interface ContextSource {
  type: "pdf" | "url" | "video";
  content: string;
  title: string;
}

/**
 * Generate interview question using context material
 */
export async function generateQuestionWithFileSearch(
  contextContent: string,
  userTranscript: string,
  previousQuestions: string[],
  systemPrompt: string
): Promise<{ success: boolean; question?: string; error?: string }> {
  try {
    if (!API_KEY) {
      return { success: false, error: "No API key configured" };
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.7 }
    });

    const prompt = `
${systemPrompt}

You are conducting an interview based on this context material:

--- CONTEXT MATERIAL ---
${contextContent}
--- END CONTEXT ---

Context (User's Transcript so far):
"${userTranscript}"

History (Questions you already asked):
${previousQuestions.join("\n")}

Based on the context material and the user's transcript, generate a response.

If the transcript is empty, ask a relevant starter question based on the context material.

If the user has spoken, your response MUST have two parts:
1. A brief, natural acknowledgment or comment on what the user just said (show you listened).
2. A follow-up question to deepen the conversation based on the context material.

Constraints:
- Maximum 40 words total.
- Keep it conversational and natural.
- NO preamble (e.g., "Here is a question").
- Just the response text.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { success: true, question: text.trim() };
  } catch (error) {
    console.error("Error generating question with file search:");
    return { success: false, error: "Failed to generate question" };
  }
}

/**
 * Smart router: Determines which API to use based on context sources
 */
export async function generateInterviewQuestionWithContext(
  userTranscript: string,
  previousQuestions: string[],
  systemPrompt: string,
  contextSources?: ContextSource[]
): Promise<{ success: boolean; question?: string; error?: string }> {
  try {
    if (!API_KEY) {
      return { success: false, error: "No API key configured" };
    }

    // No context sources - use regular generation
    if (!contextSources || contextSources.length === 0) {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { temperature: 0.7 }
      });

      const prompt = `
${systemPrompt}

Context (User's Transcript so far):
"${userTranscript}"

History (Questions you already asked):
${previousQuestions.join("\n")}

Generate a response.

If the transcript is empty, ask a relevant starter question.

If the user has spoken, your response MUST have two parts:
1. A brief, natural acknowledgment or comment on what the user just said.
2. A follow-up question to deepen the conversation.

Constraints:
- Maximum 40 words total.
- Keep it conversational and natural.
- Just the response text.
      `.trim();

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return { success: true, question: text.trim() };
    }

    // Check if we have YouTube video sources - those use gemini-video.ts
    const videoSources = contextSources.filter(s => s.type === "video");
    
    if (videoSources.length > 0) {
      return { success: false, error: "Video context requires separate handling" };
    }

    // Use File Search API for PDF/URL content
    const textContent = contextSources
      .map(s => `[${s.type.toUpperCase()}] ${s.title}:\n${s.content}`)
      .join("\n\n---\n\n");

    return await generateQuestionWithFileSearch(
      textContent,
      userTranscript,
      previousQuestions,
      systemPrompt
    );
  } catch (error) {
    console.error("Error in smart router:");
    return { success: false, error: "Failed to generate question" };
  }
}
