"use server";

import { generateChatResponse } from "@/meetmate/services/ai/gemini";
import { sendVideoQuestion } from "@/meetmate/services/ai/gemini-video";
import {
  uploadTextToStore,
  queryFileSearchStore,
  getOrCreateDefaultStore,
} from "@/meetmate/services/ai/gemini-file-search";
import { auth } from "@/features/auth/controller/auth";
import { prisma } from "@/meetmate/services/db/prisma";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import {
  buildChatPrompt,
  generateChatMetadata,
  parseChatContent,
  type ChatMessage,
  type ChatConversation,
  type ChatMode,
  detectSourceTypes,
  buildFileSearchPrompt,
} from "../procedure";
import { saveFeedback } from "@/features/feedback/controller";
import { getFlashcards } from "@/features/flashcards/controller";

/**
 * CONTROLLER LAYER - Chat Feature
 * Handles all I/O operations (DB, AI)
 * No business logic - only I/O coordination
 */

/**
 * Enhanced chat message with source information
 */
export interface SourceInfo {
  id: string;
  title: string;
  type: "youtube" | "text" | "pdf";
  videoId?: string;
  videoUrl?: string;
  content?: string;
}

/**
 * Generate feedback for a user message
 */
async function generateFeedbackForMessage(
  userMessage: string,
  userId?: string
): Promise<string | null> {
  try {
    const systemPrompt = `You are a casual American English tutor providing friendly, conversational feedback on language usage.

🎯 YOUR ROLE:
- Analyze the user's English and provide casual, helpful feedback
- **FIRST**: Correct any mistakes (grammar, spelling, word usage)
- **THEN**: Suggest more natural, native-sounding alternatives
- Use a friendly, encouraging tone (like talking to a friend)

📝 FEEDBACK PRIORITY:
1. **Mistakes/Errors** (if any):
   - Grammar mistakes
   - Spelling errors
   - Wrong word usage
   - Unnatural phrasings

2. **Natural Alternatives** (even when correct):
   - Contractions: "I am" → "I'm", "going to" → "gonna"
   - Connected speech: "want to" → "wanna", "got to" → "gotta"
   - Expressions: More casual/idiomatic ways to say the same thing
   - Slang: Casual American slang when appropriate
   - Word choice: More common/natural vocabulary

✅ FEEDBACK STYLE:
- Start with corrections if there are mistakes
- Then suggest natural alternatives
- Use casual language: "Hey, quick fix...", "You could also say..."
- Be encouraging: "Nice! Just a small thing..." or "This works, but..."
- Keep it brief (3-5 points max)
- Use emojis sparingly
- Format with markdown

❌ AVOID:
- Formal academic language
- Grammar terminology (no "present perfect", "subjunctive", etc.)
- Being harsh or overly critical
- Long explanations

EXAMPLE WITH MISTAKES:
**Hey! Quick fixes:** 😊

- **Grammar**: "I go to store" → "I went to the store" (past tense + article)
- **More natural**: "I went to the store" → "I stopped by the store" (sounds more casual)
- **Contraction**: "I am hungry" → "I'm hungry"

EXAMPLE WITHOUT MISTAKES (already correct):
**Nice!** 👍 Here's how to sound even more native:

- **Contraction**: "I am going to" → "I'm gonna"
- **Expression**: "I think that's good" → "I feel like that's pretty solid"
- **Slang**: "It's very good" → "It's fire" or "It's dope" (super casual!)

Keep it up! 🌟`;

    const feedback = await generateChatResponse(systemPrompt, userMessage, 0.7, userId);
    return feedback || null;
  } catch (error) {
    console.error("Error generating feedback:");
    return null;
  }
}

/**
 * Send chat message and get AI response
 * Intelligently routes to Video Understanding, File Search, or regular chat based on sources
 * Automatically generates and saves feedback for user messages
 */
export async function sendChatMessage(
  message: string,
  previousMessages: ChatMessage[],
  contextData?: string,
  isQuizMode?: boolean,
  sources?: SourceInfo[],
  messageId?: string,
  chatMode?: string
): Promise<{ success: boolean; response?: string; feedbackId?: string; error?: string }> {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // 3. Validate message
    if (!message || message.trim().length === 0) {
      return { success: false, error: "Message cannot be empty" };
    }

    let aiResponse: { success: boolean; response?: string; error?: string };

    // Start feedback generation in PARALLEL (Optimization for latency)
    const feedbackPromise = generateFeedbackForMessage(message, session.user.id);

    // If sources are provided, use smart routing
    if (sources && sources.length > 0) {
      const sourceTypes = detectSourceTypes(sources);

      // Route to Video Understanding if we have YouTube videos
      if (sourceTypes.hasYouTube && sources.length === 1) {
        const videoSource = sources.find((s) => s.type === "youtube");
        if (videoSource?.videoUrl) {
          aiResponse = await sendChatWithVideoUnderstanding(
            videoSource.videoUrl,
            message,
            previousMessages,
            isQuizMode || false,
            session.user.id
          );
        } else {
          aiResponse = { success: false, error: "Invalid video source" };
        }
      }
      // Route to File Search if we have text/pdf sources or mixed sources
      else if (sourceTypes.hasText || sourceTypes.hasPdf || (sourceTypes.hasYouTube && sources.length > 1)) {
        aiResponse = await sendChatWithFileSearch(
          message,
          previousMessages,
          sources,
          isQuizMode || false,
          session.user.id
        );
      } else {
        aiResponse = { success: false, error: "Invalid sources" };
      }
    } else {
      // Fallback to regular chat with context (legacy support)
      aiResponse = await sendChatRegular(message, previousMessages, contextData, isQuizMode, chatMode, session.user.id);
    }

    // If AI response was successful, save the pre-generated feedback
    let feedbackId: string | undefined;
    if (aiResponse.success && aiResponse.response) {
      // Await the feedback that was running in parallel
      const feedbackText = await feedbackPromise;

      if (feedbackText) {
        const feedbackResult = await saveFeedback(
          message,
          feedbackText,
          messageId,
          sources?.[0]?.id
        );

        if (feedbackResult.success && feedbackResult.feedback) {
          feedbackId = feedbackResult.feedback.id;
        }
      }
    }

    return {
      ...aiResponse,
      feedbackId,
    };
  } catch (error) {
    console.error("Failed to send chat message:");
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Send chat with Video Understanding API (for single YouTube video)
 */
async function sendChatWithVideoUnderstanding(
  videoUrl: string,
  message: string,
  previousMessages: ChatMessage[],
  isQuizMode: boolean,
  userId?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const result = await sendVideoQuestion(videoUrl, message, previousMessages, isQuizMode, userId);
    return result;
  } catch (error) {
    console.error("Failed to send video question:");
    return { success: false, error: "Failed to process video question" };
  }
}

/**
 * Send chat with File Search API (for text sources or multiple sources)
 */
async function sendChatWithFileSearch(
  message: string,
  previousMessages: ChatMessage[],
  sources: SourceInfo[],
  isQuizMode: boolean,
  userId?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    // Get or create the default file search store
    const storeResult = await getOrCreateDefaultStore();
    if (!storeResult.success || !storeResult.store) {
      return { success: false, error: "Failed to initialize file search store" };
    }

    const storeId = storeResult.store.name;

    // Upload sources to the store (if they have content and aren't already uploaded)
    for (const source of sources) {
      if (source.content && source.content.trim().length > 0) {
        await uploadTextToStore(
          storeId,
          source.title,
          source.content
        );
      }
    }

    // Build prompt for file search
    const prompt = buildFileSearchPrompt({
      message,
      previousMessages,
      isQuizMode,
      sources,
    });

    // Query the file search store
    const result = await queryFileSearchStore(
      storeId,
      prompt,
      undefined,
      userId
    );

    if (!result.success || !result.response) {
      return { success: false, error: result.error || "File search returned no response" };
    }

    const response = result.response;

    if (!response) {
      return { success: false, error: "File search returned empty response" };
    }

    return { success: true, response };
  } catch (error) {
    console.error("Failed to send file search query:");
    return { success: false, error: "Failed to search files" };
  }
}

/**
 * Regular chat without advanced features (legacy support)
 */
async function sendChatRegular(
  message: string,
  previousMessages: ChatMessage[],
  contextData?: string,
  isQuizMode?: boolean,
  chatMode?: string,
  userId?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    // Import vocabulary revival functions
    const { getPriorityVocabularyForChat, trackVocabularyUsage } = await import(
      "./vocabulary-revival"
    );
    const { buildVocabularyRevivalPrompt } = await import("../procedure/vocabulary-revival");

    // Get PRIORITY vocabulary (words that need practice most)
    let vocabularyPrompt = "";
    let flashcardVocabulary: string[] = [];
    
    try {
      const priorityResult = await getPriorityVocabularyForChat(5);
      
      if (priorityResult.success && priorityResult.priorities && priorityResult.priorities.length > 0) {
        // Build special prompt for priority words
        vocabularyPrompt = buildVocabularyRevivalPrompt(priorityResult.priorities);
        
        // Also provide all words for general use
        flashcardVocabulary = priorityResult.priorities.map(p => p.word);
      } else {
        // Fallback: use all flashcards if no priorities
        const flashcardsResult = await getFlashcards();
        if (flashcardsResult.success && flashcardsResult.flashcards) {
          flashcardVocabulary = flashcardsResult.flashcards.map(f => f.front);
        }
      }
    } catch {
      void 0;
    }

    // Build prompt using procedure (pure business logic)
    const prompt = buildChatPrompt({
      message: message.trim(),
      contextData: contextData ? contextData + vocabularyPrompt : vocabularyPrompt,
      previousMessages,
      isQuizMode,
      flashcardVocabulary,
      chatMode: chatMode as ChatMode, // Type is validated in procedure layer
    });

    // Call AI service (I/O operation)
    const response = await generateChatResponse(prompt.system, prompt.user, 0.7, userId);

    if (!response) {
      return { success: false, error: "AI returned empty response" };
    }

    // Track vocabulary usage in AI response (background task)
    // This updates lastUsedInChat and chatUsageCount
    trackVocabularyUsage(response).catch(err => 
      console.error("Failed to track vocabulary usage:")
    );

    return { success: true, response };
  } catch (error) {
    console.error("Failed to send regular chat:");
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Save chat conversation to database
 */
export async function saveChatConversation(
  messages: ChatMessage[],
  title?: string,
  existingChatId?: string
): Promise<{ success: boolean; chatId?: string; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    if (!messages || messages.length === 0) {
      return { success: false, error: "No messages to save" };
    }

    const metadata = generateChatMetadata(messages);
    const formattedMessages = messages.map((msg) => {
      // Pack feedbackId and chatMode into sources JSON if they exist (Workaround for no schema change)
      let sourcesJson = null;
      if (msg.sources || msg.feedbackId || msg.chatMode) {
        sourcesJson = JSON.stringify({ 
          s: msg.sources || [], 
          f: msg.feedbackId,
          m: msg.chatMode 
        });
      }

      return {
        role: msg.role,
        content: msg.content,
        sources: sourcesJson,
        feedbackId: msg.feedbackId,
      };
    });

    // Save to database (Relational)
    let sessionId = existingChatId;

    if (existingChatId) {
      // Update existing chat
      // Use transaction to ensure consistency (Delete/Replace pattern for correctness with frontend state)
      await prisma.$transaction(async (tx) => {
        // Verify ownership and update metadata
        await tx.chatSession.update({
            where: { id: existingChatId, userId: session.user.id },
            data: { 
                metadata: JSON.stringify(metadata),
                // Update title if explicitly provided
                ...(title ? { title } : {})
            }
        });

        // ⚠️ SCALABILITY NOTE: 
        // Syncing by "Delete All + Insert All" is robust for consistency but write-heavy.
        // For 20k scale, moving to an "Append Only" API on the frontend would be better.
        // For now, this is the safest implementation that matches current frontend behavior.
        await tx.chatMessage.deleteMany({
            where: { sessionId: existingChatId }
        });

        await tx.chatMessage.createMany({
            data: formattedMessages.map(msg => ({
                sessionId: existingChatId,
                role: msg.role,
                content: msg.content,
                sources: msg.sources, // This now contains packed JSON
                model: "gemini", // Default
            }))
        });
      });
      void 0;
    } else {
      // Create new chat
      const chatTitle = title || await generateChatTitle(messages);
      
      const newSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: chatTitle,
          metadata: JSON.stringify(metadata),
          messages: {
            create: formattedMessages.map(msg => ({
                role: msg.role,
                content: msg.content,
                sources: msg.sources, // This now contains packed JSON
                model: "gemini"
            }))
          }
        },
      });
      sessionId = newSession.id;
      void 0;
    }

    return { success: true, chatId: sessionId };
  } catch (error) {
    console.error("Error saving chat conversation:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save conversation",
    };
  }
}

/**
 * Load chat conversation from database
 */
export async function loadChatConversation(
  chatId: string
): Promise<{ success: boolean; messages?: ChatMessage[]; title?: string; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Load from Relational Tables
    const chatSession = await prisma.chatSession.findUnique({
        where: { id: chatId, userId: session.user.id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!chatSession) {
        // Fallback: Check Legacy Notes (so user doesn't panic if migration wasn't run)
        // This is a safety/transition mechanism.
        // TODO: Remove this after full migration.
        const legacyNote = await prisma.note.findFirst({
            where: { id: chatId, userId: session.user.id, category: "CHAT" }
        });

        if (legacyNote) {
            console.warn("⚠️ Loading legacy chat from Note table. Run migration script recommended.");
            return {
                success: true,
                messages: parseChatContent(legacyNote.content),
                title: legacyNote.title
            };
        }

        return { success: false, error: "Chat not found" };
    }

    // Transform DB messages to Frontend messages
    const messages: ChatMessage[] = chatSession.messages.map(msg => {
        let sources = undefined;
        let feedbackId = undefined;
        let chatMode = undefined;

        if (msg.sources) {
            try {
                const parsed = JSON.parse(msg.sources);
                if (Array.isArray(parsed)) {
                    // Legacy format: just SourceInfo[]
                    sources = parsed;
                } else if (parsed && typeof parsed === 'object') {
                    // New format: { s: sources, f: feedbackId, m: chatMode }
                    if ('s' in parsed) sources = parsed.s;
                    if ('f' in parsed) feedbackId = parsed.f;
                    if ('m' in parsed) chatMode = parsed.m;
                    
                    // Fallback for full names
                    if ('sources' in parsed) sources = parsed.sources;
                    if ('feedbackId' in parsed) feedbackId = parsed.feedbackId;
                    if ('chatMode' in parsed) chatMode = parsed.chatMode;
                }
            } catch (e) {
                console.warn("Failed to parse sources JSON:");
            }
        }

        return {
            role: msg.role as "user" | "ai",
            content: msg.content,
            sources: sources,
            feedbackId: feedbackId,
            chatMode: chatMode as ChatMode
        };
    });

    return {
      success: true,
      messages,
      title: chatSession.title,
    };
  } catch (error) {
    console.error("Error loading chat conversation:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load conversation",
    };
  }
}

/**
 * Get all saved chat conversations
 */
export async function getChatConversations(): Promise<{
  success: boolean;
  chats?: ChatConversation[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Load from Relational Tables
    const chats = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc", // Sort by last activity
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true
      },
      // Optimization: Limit fetch size for initial load in future (e.g. take: 50)
    });

    // Check if we have very few chats? Mapping legacy?
    // For listing, we prioritize the new system.
    // If a user has 0 new chats, they might need migration.
    
    return { 
        success: true, 
        chats: chats.map(c => ({
            id: c.id,
            title: c.title,
            createdAt: c.createdAt // or updatedAt
        }))
    };
  } catch (error) {
    console.error("Error fetching chat conversations:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch conversations",
    };
  }
}

/**
 * Delete a chat conversation
 */
export async function deleteChatConversation(
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Attempt delete from Relational Table (Cascades to messages)
    try {
        await prisma.chatSession.delete({
            where: { id: chatId, userId: session.user.id }
        });
    } catch {
        // If not found, try legacy delete
        await prisma.note.deleteMany({
            where: { id: chatId, userId: session.user.id, category: "CHAT" }
        });
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat conversation:");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete conversation",
    };
  }
}

/**
 * Generate a title for the chat using AI
 */
async function generateChatTitle(messages: ChatMessage[]): Promise<string> {
  try {
    // Find the first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const userContent = firstUserMsg?.content || "";
    
    // Fallback: First 5 words of user message
    const fallbackTitle = userContent 
      ? userContent.split(' ').slice(0, 5).join(' ') + (userContent.split(' ').length > 5 ? '...' : '')
      : `Chat ${new Date().toLocaleDateString()}`;

    const conversationSample = messages.slice(0, 3)
      .map((msg) => `${msg.role === "ai" ? "AI" : "User"}: ${msg.content}`)
      .join("\n");

    const prompt = `Based on this conversation start, generate a very short, specific title (2-5 words).
    
RULES:
- Be descriptive of the TOPIC (e.g., "Job Interview Tips", "Past Tense Practice", "Discussing Movies").
- AVOID generic titles like "English Practice" or "Conversation".
- AVOID quotes.

Conversation:
${conversationSample}

Title:`;

    const title = await generateChatResponse(
      "You are a helpful assistant that creates concise, topic-specific titles.",
      prompt,
      0.7
    );

    let finalTitle = title?.trim()?.replace(/^["']|["']$/g, '') || fallbackTitle;
    
    // Ensure it's not too long
    if (finalTitle.length > 50) {
        finalTitle = finalTitle.substring(0, 47) + "...";
    }
    
    return finalTitle;
  } catch (error) {
    console.error("Error generating title:");
    return `Chat ${new Date().toLocaleDateString()}`;
  }
}
