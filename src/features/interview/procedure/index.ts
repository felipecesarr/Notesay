import type { Skill, AIConfig } from "@/meetmate/services/ai/gemini";

/**
 * PROCEDURE LAYER - AI Interaction Feature
 * Pure business logic for building prompts and processing AI responses
 * No I/O - just data transformation and logic
 */

// Build system prompt based on skill and config
export function buildSystemPrompt(
  skill: Skill,
  config: AIConfig,
  customPromptOverride?: string
): string {
  if (customPromptOverride && customPromptOverride.trim()) {
    return customPromptOverride.trim();
  }

  const basePrompts: Record<Skill, string> = {
    "English Teacher": `You are a supportive English teacher conducting a language practice session. 
Your goal is to help the student improve their English speaking skills through natural conversation.
Ask questions that encourage them to speak, and provide gentle corrections when needed.`,

    "YC Interview": `You are a YC partner conducting a startup interview.
Ask tough but fair questions about the business model, market, traction, and team.
Be direct and challenging, but constructive. Focus on finding weaknesses to help strengthen the pitch.`,

    "Job Interview": `You are an experienced hiring manager conducting a job interview.
Ask relevant questions about experience, skills, problem-solving, and cultural fit.
Be professional and thorough, probing deeper into answers to understand the candidate.`,

    "Journal": `You are a thoughtful journaling companion.
Ask reflective questions that help the user explore their thoughts, feelings, and experiences.
Be empathetic and encouraging, creating a safe space for self-reflection.`,

    "Therapist": `You are a compassionate therapist in a supportive counseling session.
Ask open-ended questions that help the person explore their emotions and thoughts.
Be empathetic, non-judgmental, and focused on active listening.`,
  };

  let prompt = basePrompts[skill] || basePrompts.Journal;

  // Add tone modifier
  const toneModifiers: Record<string, string> = {
    Friendly: "Maintain a warm and approachable tone.",
    Professional: "Keep a professional and respectful demeanor.",
    Encouraging: "Be especially positive and motivating in your responses.",
    Strict: "Be direct and hold high standards.",
    Casual: "Keep the conversation relaxed and informal.",
    Formal: "Maintain formal language and structure.",
    Empathetic: "Show deep understanding and emotional connection.",
    Direct: "Be straightforward and to the point.",
  };

  if (config.tone && toneModifiers[config.tone]) {
    prompt += `\n\n${toneModifiers[config.tone]}`;
  }

  // Add creativity guidance
  const creativityGuidance: Record<string, string> = {
    Low: "Keep questions straightforward and predictable.",
    Medium: "Balance between standard and creative questions.",
    High: "Be creative and ask unexpected, thought-provoking questions.",
  };

  if (config.creativity && creativityGuidance[config.creativity]) {
    prompt += `\n\n${creativityGuidance[config.creativity]}`;
  }

  return prompt;
}

// Build context from previous conversation
export function buildConversationContext(
  transcript: string,
  previousQuestions: string[],
  maxLength: number = 2000
): string {
  let context = "";

  // Add previous Q&A pairs
  if (previousQuestions.length > 0) {
    context += "Previous conversation:\n";
    previousQuestions.forEach((q, i) => {
      context += `Q${i + 1}: ${q}\n`;
    });
    context += "\n";
  }

  // Add current transcript
  if (transcript.trim()) {
    const recentTranscript =
      transcript.length > maxLength
        ? "..." + transcript.slice(-maxLength)
        : transcript;

    context += `Current response: ${recentTranscript}`;
  }

  return context;
}

// Extract question from AI response
export function extractQuestion(aiResponse: string): string {
  // Remove any leading/trailing whitespace
  const question = aiResponse.trim();

  // If response contains multiple sentences, try to extract just the question
  const questionMatch = question.match(/[^.!?]*\?/);
  if (questionMatch) {
    return questionMatch[0].trim();
  }

  // If no question mark found, return first sentence or whole response
  const firstSentence = question.split(/[.!?]/)[0];
  return (firstSentence || question).trim();
}

// Validate AI response
export function validateAIResponse(response: string): {
  isValid: boolean;
  error?: string;
} {
  if (!response || !response.trim()) {
    return { isValid: false, error: "Empty response from AI" };
  }

  if (response.length > 500) {
    return { isValid: false, error: "Response too long (max 500 characters)" };
  }

  if (response.length < 5) {
    return { isValid: false, error: "Response too short" };
  }

  return { isValid: true };
}

// Calculate creativity temperature for AI model
export function getTemperature(creativity: "Low" | "Medium" | "High"): number {
  const temperatures = {
    Low: 0.3,
    Medium: 0.7,
    High: 1.0,
  };

  return temperatures[creativity];
}

// Detect if user has finished answering (silence detection)
export function shouldTriggerNextQuestion(
  currentTranscriptLength: number,
  previousTranscriptLength: number,
  silenceDuration: number,
  minSilenceDuration: number = 2000 // 2 seconds
): boolean {
  // User hasn't spoken enough
  if (currentTranscriptLength < 10) {
    return false;
  }

  // No new content in the required silence duration
  const hasNewContent = currentTranscriptLength > previousTranscriptLength;
  const silenceLongEnough = silenceDuration >= minSilenceDuration;

  return !hasNewContent && silenceLongEnough;
}

// Format transcript for display
export function formatTranscriptForDisplay(
  transcript: string,
  maxLength: number = 1000
): string {
  if (!transcript) return "";

  const trimmed = transcript.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return "..." + trimmed.slice(-maxLength);
}

// Split transcript into sentences
export function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Get last N sentences
export function getRecentSentences(text: string, count: number = 3): string {
  const sentences = splitIntoSentences(text);
  return sentences.slice(-count).join(". ") + ".";
}

// Check if transcript contains keywords (for context awareness)
export function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
}

// Calculate conversation quality score (simple heuristic)
export function calculateConversationQuality(
  transcript: string,
  questionCount: number
): {
  score: number; // 0-100
  feedback: string;
} {
  const words = transcript.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const avgWordsPerQuestion = questionCount > 0 ? wordCount / questionCount : 0;

  let score = 50; // Base score
  let feedback = "";

  // Good length responses
  if (avgWordsPerQuestion >= 20 && avgWordsPerQuestion <= 100) {
    score += 20;
    feedback = "Good response length!";
  } else if (avgWordsPerQuestion < 10) {
    score -= 10;
    feedback = "Try giving more detailed answers.";
  } else if (avgWordsPerQuestion > 150) {
    score -= 5;
    feedback = "Try to be more concise.";
  }

  // Engagement (number of questions answered)
  if (questionCount >= 5) {
    score += 15;
  }

  if (questionCount >= 10) {
    score += 10;
  }

  // Variety in vocabulary (unique words)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const vocabularyRatio = uniqueWords.size / words.length;

  if (vocabularyRatio > 0.6) {
    score += 10;
  }

  // Ensure score is in valid range
  score = Math.max(0, Math.min(100, score));

  return { score, feedback };
}
