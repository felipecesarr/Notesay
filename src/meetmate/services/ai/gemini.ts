"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  trackTokenUsage,
  extractTokenMetadata
} from "@/meetmate/services/token-tracking";

const API_KEY = process.env.GEMINI_API_KEY || "";

export type Skill = "English Teacher" | "YC Interview" | "Job Interview" | "Journal" | "Therapist" | (string & {});

const SYSTEM_PROMPTS: Record<Skill, string> = {
  "English Teacher": `You are a friendly and patient English teacher helping non-native speakers improve their conversational English.

YOUR BEHAVIOR:
- Ask ONE simple, clear question at a time
- Use everyday vocabulary and short sentences
- If the user makes a grammar mistake, acknowledge what they said first, then gently correct it in your next response
- Be encouraging and positive - praise their efforts
- Focus on natural conversation, not testing
- Keep your responses under 30 words

EXAMPLE INTERACTION:
User: "I go to work yesterday and see my friend"
You: "Nice! You saw your friend at work. That must have been fun! By the way, we say 'went' for past. What did you two talk about?"`,

  "YC Interview": `You are a partner at Y Combinator conducting a startup interview. You are known for being direct, skeptical, and laser-focused on what matters.

YOUR BEHAVIOR:
- Ask hard, pointed questions about growth, market size, and traction
- Challenge assumptions immediately - don't let vague answers slide
- Be concise and rapid-fire - keep responses under 25 words
- Follow up on weak points relentlessly
- If the answer is unclear, push for specifics (numbers, timelines, evidence)

EXAMPLE INTERACTION:
User: "We're building a platform for productivity"
You: "That's vague. What exactly does your product do? How many users do you have? What's your monthly growth rate?"`,

  "Job Interview": `You are a professional hiring manager conducting a behavioral interview. You want to assess the candidate's real experience and problem-solving skills.

YOUR BEHAVIOR:
- Ask behavioral questions using the STAR method (Situation, Task, Action, Result)
- Listen carefully to their answer, then drill into specifics
- Ask follow-up questions about challenges, decisions, and outcomes
- Be professional but warm - create a comfortable atmosphere
- Focus on understanding their thought process and impact
- Keep your responses under 35 words

EXAMPLE INTERACTION:
User: "I led a team project that increased sales"
You: "That's great! Tell me about a specific challenge your team faced during that project. What was the situation, and how did you handle it?"`,

  "Journal": `You are a thoughtful and empathetic journaling companion. Your goal is to help the user explore their thoughts and feelings through reflection.

YOUR BEHAVIOR:
- Ask ONE deep, open-ended question at a time
- Be curious and non-judgmental
- Reflect back what they share to show you're listening
- Help them explore the "why" behind their feelings
- Use poetic and insightful language
- Keep your responses under 30 words

EXAMPLE INTERACTION:
User: "Today was exhausting, I didn't get much done"
You: "It sounds like you're feeling frustrated with yourself. What would 'enough' have looked like today? What were you hoping to accomplish?"`,

  "Therapist": `You are a supportive and empathetic listener trained in active listening techniques. You create a safe, non-judgmental space for emotional exploration.

YOUR BEHAVIOR:
- Ask open-ended questions that invite deeper reflection
- Use reflective listening - paraphrase what they share to show understanding
- Never diagnose or give medical advice - you're a supportive listener, not a clinician
- Validate their emotions without judgment
- Help them explore patterns and insights
- Keep your responses under 30 words

EXAMPLE INTERACTION:
User: "I feel like I'm failing at everything"
You: "That sounds really heavy to carry. When you say 'everything,' what areas of your life are weighing on you the most right now?"`,
};

export interface AIConfig {
  skill: Skill;
  tone: string;
  creativity: "Low" | "Medium" | "High";
  customPrompt: string;
  contextSource: string;
}

export async function generateInterviewQuestion(
  transcript: string,
  previousQuestions: string[],
  config: AIConfig,
  contextData?: string,
  userId?: string
): Promise<string> {
  if (!API_KEY) {
    console.warn("No Gemini API Key provided.");
    return "I'm ready to listen. Please check your API key configuration.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const temperature = config.creativity === "Low" ? 0.2 : config.creativity === "High" ? 0.9 : 0.5;
    const systemPrompt = config.customPrompt || SYSTEM_PROMPTS[config.skill] || SYSTEM_PROMPTS["Journal"];

    let contextSection = "";
    if (contextData) {
      contextSection = `\nUploaded Context Material:\n${contextData}\n\nIMPORTANT: Base your questions on this context material.\n`;
    } else if (config.contextSource) {
      contextSection = `\nAdditional Context: ${config.contextSource}\n`;
    }

    const prompt = `${systemPrompt}

Configuration:
- Tone of Voice: ${config.tone || "Default for persona"}
- Custom Instructions: ${config.customPrompt || "None"}
${contextSection}

The user is currently recording a video response.

Context (User's Transcript so far):
"${transcript}"

History (Questions you already asked):
${previousQuestions.join("\n")}

Based on the ${contextData ? "uploaded context material and " : ""}transcript, generate a response.

If the transcript is empty, ask a relevant starter question ${contextData ? "based on the context material" : "for your persona"}.

If the user has spoken, your response MUST have two parts:
1. A brief, natural acknowledgment or comment on what the user just said (show you listened).
2. A follow-up question to deepen the conversation.

Constraints:
- Maximum 40 words total.
- Keep it conversational and natural.
- NO preamble (e.g., "Here is a question").
- Just the response text.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { temperature }
    });

    const result = await model.generateContent(prompt);

    // Track token usage
    if (userId) {
      const tokens = extractTokenMetadata(result);
      trackTokenUsage({
        userId,
        feature: 'interview',
        action: 'generateInterviewQuestion',
        model: 'gemini-2.5-flash-lite',
        ...tokens,
      });
    }

    return result.response.text().trim() || "Tell me more about that.";
  } catch (error) {
    console.error("Error generating question:");
    return "Tell me more about that.";
  }
}

export async function enhanceSystemPrompt(userPrompt: string, userId?: string): Promise<string> {
  if (!API_KEY) {
    return userPrompt;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an expert in prompt engineering. Enhance this system prompt to be more effective:

"${userPrompt}"

Guidelines:
1. Make the role/persona crystal clear
2. Define specific behaviors and tone
3. Set clear boundaries and constraints
4. Specify response style (length, format, approach)
5. Keep it concise but comprehensive

Return ONLY the enhanced system prompt, nothing else.`;

    const result = await model.generateContent(prompt);

    // Track token usage
    if (userId) {
      const tokens = extractTokenMetadata(result);
      trackTokenUsage({
        userId,
        feature: 'interview',
        action: 'enhanceSystemPrompt',
        model: 'gemini-2.5-flash-lite',
        ...tokens,
      });
    }

    return result.response.text().trim() || userPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:");
    return userPrompt;
  }
}

export async function generateChatResponse(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7,
  userId?: string
): Promise<string> {
  if (!API_KEY) {
    return "I'm ready to chat. Please check your API key configuration.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt,
      generationConfig: { temperature }
    });

    const result = await model.generateContent(userPrompt);

    // Track token usage
    if (userId) {
      const tokens = extractTokenMetadata(result);
      trackTokenUsage({
        userId,
        feature: 'chat',
        action: 'generateChatResponse',
        model: 'gemini-2.5-flash-lite',
        ...tokens,
      });
    }

    return result.response.text().trim() || "I'm having trouble processing that. Could you try again?";
  } catch (error) {
    console.error("Error generating chat response:");
    return "I'm having trouble processing that. Could you try again?";
  }
}

export async function generateWordAnalysis(text: string, userId?: string): Promise<{
  word: string;
  tense: string;
  phonetic: string;
  meaning: string;
  usage: string;
  synonyms: string[];
  antonyms: string[];
  interviewTip: string;
}> {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `Analyze the word or phrase: "${text}".

This analysis is for NON-NATIVE English speakers preparing for a job interview.
Make your explanation SIMPLE, CLEAR, and ILLUSTRATIVE.

Special instructions:
- If this is a CONTRACTION (e.g., "don't", "won't"), EXPLAIN what it stands for
- If this is an IDIOM or PHRASAL VERB, explain it in SIMPLE words
- Use SIMPLE vocabulary in your definition
- Provide a RELATABLE example

Return ONLY a JSON object with this exact structure:
{
  "word": "${text}",
  "tense": "ONE of: Past, Present, Future, or N/A",
  "phonetic": "IPA pronunciation with simplified guide",
  "meaning": "SIMPLE, clear definition",
  "usage": "A professional sentence example",
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4", "synonym5"],
  "antonyms": ["antonym1", "antonym2", "antonym3", "antonym4", "antonym5"],
  "interviewTip": "A brief, practical tip for using this word in an interview"
}`;

    const result = await model.generateContent(prompt);

    // Track token usage
    if (userId) {
      const tokens = extractTokenMetadata(result);
      trackTokenUsage({
        userId,
        feature: 'notes',
        action: 'generateWordAnalysis',
        model: 'gemini-2.5-flash-lite',
        ...tokens,
      });
    }

    const textResponse = result.response.text() || "{}";
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error analyzing word:");
    return {
      word: text,
      tense: "N/A",
      phonetic: "",
      meaning: "Unable to analyze this word at the moment.",
      usage: `"${text}"`,
      synonyms: [],
      antonyms: [],
      interviewTip: "",
    };
  }
}
