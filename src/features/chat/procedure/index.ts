/**
 * PROCEDURE LAYER - Chat Feature
 * Pure business logic for chat functionality
 * No I/O - just data transformation and logic
 */

// Export and import chat modes for use in this file
export * from "./chat-modes";
export type { ChatMode } from "./chat-modes";
import { getChatModePrompt, type ChatMode } from "./chat-modes";

// Export vocabulary revival
export * from "./vocabulary-revival";

export interface ChatMessage {
  role: "ai" | "user";
  content: string;
  sources?: Array<{ id: string; title: string; type: "youtube" | "text" | "pdf" }>;
  feedbackId?: string; // ID of pre-generated feedback for user messages
  chatMode?: ChatMode; // AI conversation mode used for this message
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
}

export interface SourceInfo {
  id: string;
  title: string;
  type: "youtube" | "text" | "pdf";
  videoId?: string;
  videoUrl?: string;
  content?: string;
}

/**
 * Detect what types of sources are in the array
 */
export function detectSourceTypes(sources: SourceInfo[]): {
  hasYouTube: boolean;
  hasText: boolean;
  hasPdf: boolean;
} {
  return {
    hasYouTube: sources.some((s) => s.type === "youtube"),
    hasText: sources.some((s) => s.type === "text"),
    hasPdf: sources.some((s) => s.type === "pdf"),
  };
}

/**
 * Parse saved chat content back to messages
 */
export function parseChatContent(content: string): ChatMessage[] {
  try {
    // Parse JSON format
    return JSON.parse(content);
  } catch {
    // Fallback: if it's old markdown format or invalid, return empty array
    return [];
  }
}

/**
 * Build chat prompt with selected conversation mode
 */
export interface BuildChatPromptInput {
  message: string;
  contextData?: string;
  previousMessages: ChatMessage[];
  isQuizMode?: boolean;
  flashcardVocabulary?: string[];
  chatMode?: ChatMode; // Chat conversation mode
}

export interface BuildChatPromptOutput {
  system: string;
  user: string;
}

export function buildChatPrompt(input: BuildChatPromptInput): BuildChatPromptOutput {
  const { message, contextData, previousMessages, isQuizMode, flashcardVocabulary, chatMode = "chill" } = input;

  // Get base system prompt from selected chat mode
  let systemPrompt = getChatModePrompt(chatMode);

  // Add context if available (YouTube transcript, PDF, etc.)
  if (contextData) {
    if (isQuizMode) {
      // QUIZ MODE: Ask questions using source vocabulary
      systemPrompt += `\n\n💡 QUIZ MODE: Ask them about this content using vocabulary from it!

Source material:
${contextData.slice(0, 3000)}

HOW TO CHAT:
- Ask questions that make them explain things from the source
- Use words and phrases that appear in the source naturally in your questions
- Ask ONE question at a time
- Keep it casual: "So what's up with..." or "Can you break down that part about..."
- React naturally: "Oh interesting!" "That's cool!" "Tell me more"
- Don't be a teacher - be a curious friend

Remember: Use the source's vocabulary in your questions!`;
    } else {
      // NORMAL MODE: Chat using source vocabulary
      systemPrompt += `\n\n💬 CHAT MODE: Talk about this topic using vocabulary from it!
${contextData.slice(0, 3000)}

HOW TO CHAT:
- Use words and phrases from the source naturally in your responses
- Talk casually like you're discussing something interesting with a friend
- React authentically: "Oh that's dope!" "Yeah I see that"
- Keep it short and conversational
- Weave in the source vocabulary so they see those words in action

⛔ IMPORTANT - NOT A QUIZ:
- DO NOT ask "comprehension check" questions (e.g. "What did you think about X?") unless natural
- DO NOT act like a teacher or examiner
- Just share your own thoughts and reactions to the content
- Only ask a question if it's a natural conversation starter, not a test`;
    }
  } else {
    // No sources - use flashcard vocabulary if available
    if (flashcardVocabulary && flashcardVocabulary.length > 0) {
      const vocabList = flashcardVocabulary.slice(0, 20).join(", ");
      systemPrompt += `\n\n📚 VOCABULARY PRACTICE: Use these words/phrases they're learning in your responses!

Their flashcard vocabulary: ${vocabList}

HOW TO CHAT:
- Naturally use words from their flashcard list in your responses
- This helps them see those words in real conversation
- Don't force it - just weave them in when it makes sense
- Keep it casual and conversational
- They need to practice with the vocabulary they're studying!`;
    } else {
      systemPrompt += `\n\n💬 No sources selected - just chat naturally and help them practice English!`;
    }
  }

  // Build conversation history for user prompt
  let userPrompt = "";

  // Add recent message history (last 10 messages)
  const recentMessages = previousMessages.slice(-10);
  if (recentMessages.length > 0) {
    userPrompt += "Conversation history:\n";
    recentMessages.forEach((msg) => {
      const label = msg.role === "ai" ? "Assistant" : "User";
      userPrompt += `${label}: ${msg.content}\n`;
    });
    userPrompt += "\n";
  }

  // Add current user message
  userPrompt += `User's new message: ${message}`;

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

/**
 * Format chat messages for saving
 */
export function formatChatForSaving(messages: ChatMessage[]): string {
  return JSON.stringify(messages);
}

/**
 * Generate metadata for saved chat
 */
export function generateChatMetadata(messages: ChatMessage[]) {
  return {
    messageCount: messages.length,
    savedAt: new Date().toISOString(),
  };
}

/**
 * Build prompt for Video Understanding API
 */
export interface BuildVideoUnderstandingPromptInput {
  message: string;
  previousMessages: ChatMessage[];
  isQuizMode: boolean;
}

export function buildVideoUnderstandingPrompt(
  input: BuildVideoUnderstandingPromptInput
): string {
  const { message, previousMessages, isQuizMode } = input;

  let prompt = "";

  // Add conversation history
  const recentMessages = previousMessages.slice(-10);
  if (recentMessages.length > 0) {
    prompt += "Previous conversation:\n";
    recentMessages.forEach((msg) => {
      const label = msg.role === "ai" ? "Assistant" : "User";
      prompt += `${label}: ${msg.content}\n`;
    });
    prompt += "\n";
  }

  // Add current message
  if (isQuizMode) {
    prompt += `Quiz question context: ${message}`;
  } else {
    prompt += `User's question about the video: ${message}`;
  }

  return prompt;
}

/**
 * Build prompt for File Search API
 */
export interface BuildFileSearchPromptInput {
  message: string;
  previousMessages: ChatMessage[];
  isQuizMode: boolean;
  sources: SourceInfo[];
}

export function buildFileSearchPrompt(input: BuildFileSearchPromptInput): string {
  const { message, previousMessages, isQuizMode, sources } = input;

  let prompt = "";

  // Add persona with strict source enforcement
  if (isQuizMode) {
    prompt += `You're a friendly conversation partner helping someone practice English by talking about stuff they're learning.

🎯 YOUR VIBE: Casual friend who's genuinely interested in what they're studying.

🎯 CRITICAL - FOCUS ON CURRENT SOURCES:
Talk ONLY about the sources they selected in THIS message. Ignore any sources from earlier in the conversation.

💬 HOW TO CHAT:
- Ask questions that make them explain things from the sources
- Use vocabulary and phrases that appear in the sources - this forces them to engage with that content
- Ask ONE question at a time
- Keep it conversational: "So what did you think about..." or "Can you explain that part where..."
- React naturally: "Oh interesting!" "That makes sense!" "Tell me more about that"
- Don't be a teacher - be a curious friend asking about what they learned
- Format with markdown for readability
- NEVER give grammar corrections - that's handled separately

Remember: Use the vocabulary from the sources in your questions so they have to work with those words!

`;
  } else {
    prompt += `You're a chill American friend chatting with someone about topics they're into.

🎯 YOUR VIBE: Relaxed, friendly, genuinely interested.

🎯 CRITICAL - FOCUS ON CURRENT SOURCES:
Talk ONLY about the sources they selected in THIS message. Ignore any sources from earlier.

💬 HOW TO CHAT:
- Talk like you're texting a friend - natural and casual
- Use vocabulary and phrases from the sources naturally in your responses
- React authentically: "Oh that's dope!" "Yeah I feel that" "That's pretty cool"
- Use contractions and casual speech: "gonna", "wanna", "kinda"
- Keep it short - 2-4 sentences usually
- Share quick thoughts about the topic
- Format with markdown
- NEVER give grammar tips - that's handled separately

Remember: Weave in vocabulary from the sources naturally so they see those words in action!

`;
  }

  // Add source context - emphasize these are THE CURRENT sources
  prompt += `📚 CURRENT SOURCES TO FOCUS ON (ignore any other sources from previous messages):\n${sources.map((s) => `- ${s.title}`).join("\n")}\n\n`;

  // Add conversation history (without sources to avoid confusion)
  const recentMessages = previousMessages.slice(-10);
  if (recentMessages.length > 0) {
    prompt += "Previous conversation context (for continuity only - NOT for source selection):\n";
    recentMessages.forEach((msg) => {
      const label = msg.role === "ai" ? "Assistant" : "User";
      prompt += `${label}: ${msg.content}\n`;
    });
    prompt += "\n";
  }

  // Add current message with strong emphasis
  prompt += `🎯 User's CURRENT question about the CURRENT sources listed above: ${message}`;

  return prompt;
}
