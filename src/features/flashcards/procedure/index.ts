import { Flashcard } from "../controller/types";

/**
 * Validate flashcard data before saving
 */
export function validateFlashcardData(data: {
  front: string;
  back: string;
  context?: string;
  tense?: string;
  phonetic?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.front || data.front.trim().length === 0) {
    errors.push("Front of card cannot be empty");
  }

  if (!data.back || data.back.trim().length === 0) {
    errors.push("Back of card cannot be empty");
  }

  if (data.front && data.front.length > 200) {
    errors.push("Front of card is too long (max 200 characters)");
  }

  if (data.back && data.back.length > 500) {
    errors.push("Back of card is too long (max 500 characters)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sort flashcards by review priority
 */
export function sortFlashcardsByPriority(flashcards: Flashcard[]): Flashcard[] {
  return [...flashcards].sort((a, b) => {
    const now = new Date();
    const aReview = a.nextReview ? new Date(a.nextReview) : now;
    const bReview = b.nextReview ? new Date(b.nextReview) : now;
    
    // Cards due for review first
    return aReview.getTime() - bReview.getTime();
  });
}

/**
 * Filter flashcards that are due for review
 */
export function getFlashcardsDueForReview(flashcards: Flashcard[]): Flashcard[] {
  const now = new Date();
  return flashcards.filter((card) => {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= now;
  });
}

/**
 * Group flashcards by tense
 */
export function groupFlashcardsByTense(flashcards: Flashcard[]): Record<string, Flashcard[]> {
  return flashcards.reduce((acc, card) => {
    const tense = card.tense || "N/A";
    if (!acc[tense]) {
      acc[tense] = [];
    }
    acc[tense].push(card);
    return acc;
  }, {} as Record<string, Flashcard[]>);
}
