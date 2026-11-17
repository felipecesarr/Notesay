/**
 * PROCEDURE LAYER - Vocabulary Revival
 * Pure business logic for smart vocabulary prioritization
 * No I/O - just calculations and logic
 */

export interface FlashcardWithUsage {
  id: string;
  front: string;
  back: string;
  nextReview: Date;
  lastUsedInChat: Date | null;
  chatUsageCount: number;
  interval: number;
}

export interface VocabularyPriority {
  word: string;
  meaning: string;
  priorityScore: number;
  daysSinceLastUse: number;
  daysSinceReview: number;
  usageCount: number;
  reason: string; // Why this word was prioritized
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
}

/**
 * Calculate priority score for a flashcard
 * Higher score = higher priority (more urgent to practice)
 */
export function calculateVocabularyPriority(
  flashcard: FlashcardWithUsage,
  now: Date = new Date()
): VocabularyPriority {
  const daysSinceReview = daysBetween(flashcard.nextReview, now);
  const daysSinceLastUse = flashcard.lastUsedInChat
    ? daysBetween(flashcard.lastUsedInChat, now)
    : 999; // Never used = max priority

  // Priority factors:
  // 1. Overdue for review (spaced repetition)
  // 2. Not used in chat recently
  // 3. Low usage count (needs more practice)
  
  let score = 0;
  let reason = "";

  // Factor 1: Overdue for spaced repetition review (0-50 points)
  if (daysSinceReview > 0) {
    score += Math.min(daysSinceReview * 2, 50); // Max 50 points
    reason = `Due for review (${daysSinceReview} days overdue)`;
  }

  // Factor 2: Not used in chat recently (0-40 points)
  if (daysSinceLastUse >= 14) {
    score += 40; // 14+ days = high priority
    reason = `Not used in chat for ${daysSinceLastUse} days`;
  } else if (daysSinceLastUse >= 7) {
    score += 25; // 7-13 days = medium priority
    reason = `Last used ${daysSinceLastUse} days ago`;
  } else if (daysSinceLastUse >= 3) {
    score += 10; // 3-6 days = low priority
    reason = `Last used ${daysSinceLastUse} days ago`;
  }

  // Factor 3: Low chat usage count (0-30 points)
  if (flashcard.chatUsageCount === 0) {
    score += 30; // Never used = highest priority
    if (!reason) reason = "Never used in chat";
  } else if (flashcard.chatUsageCount <= 2) {
    score += 15; // Used 1-2 times = medium priority
    if (!reason) reason = `Only used ${flashcard.chatUsageCount} times`;
  } else if (flashcard.chatUsageCount <= 5) {
    score += 5; // Used 3-5 times = low priority
  }

  // Bonus: Both overdue AND not used recently (synergy bonus)
  if (daysSinceReview > 0 && daysSinceLastUse >= 7) {
    score += 20;
    reason = `Overdue review + ${daysSinceLastUse} days unused`;
  }

  return {
    word: flashcard.front,
    meaning: flashcard.back,
    priorityScore: score,
    daysSinceLastUse,
    daysSinceReview,
    usageCount: flashcard.chatUsageCount,
    reason: reason || "Recently practiced",
  };
}

/**
 * Get priority vocabulary list from flashcards
 * Returns top N words that need practice most
 */
export function getPriorityVocabulary(
  flashcards: FlashcardWithUsage[],
  count: number = 5,
  now: Date = new Date()
): VocabularyPriority[] {
  // Calculate priority for each flashcard
  const priorities = flashcards.map((flashcard) =>
    calculateVocabularyPriority(flashcard, now)
  );

  // Sort by priority score (highest first)
  const sorted = priorities.sort((a, b) => b.priorityScore - a.priorityScore);

  // Return top N
  return sorted.slice(0, count);
}

/**
 * Detect which flashcard words appear in text (case-insensitive)
 */
export function detectUsedVocabulary(
  text: string,
  flashcards: Array<{ front: string; id: string }>
): string[] {
  const usedWordIds: string[] = [];
  const lowerText = text.toLowerCase();

  for (const flashcard of flashcards) {
    const word = flashcard.front.toLowerCase();
    
    // Use word boundary regex for accurate matching
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    
    if (regex.test(lowerText)) {
      usedWordIds.push(flashcard.id);
    }
  }

  return usedWordIds;
}

/**
 * Build vocabulary practice prompt with priority words
 */
export function buildVocabularyRevivalPrompt(
  priorityWords: VocabularyPriority[]
): string {
  if (priorityWords.length === 0) {
    return "";
  }


  return `\n\n🔄 VOCABULARY REVIVAL - Priority Words to Practice:
${priorityWords.map((w, i) => `${i + 1}. "${w.word}" - ${w.reason}`).join("\n")}

IMPORTANT: Naturally use 1-2 of these words in your response. These are words the user is learning but hasn't practiced recently in conversation. Help reinforce them by using them naturally!`;
}
