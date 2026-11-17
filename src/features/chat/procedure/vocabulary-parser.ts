/**
 * PROCEDURE LAYER - Vocabulary Parser
 * Pure business logic for parsing and marking vocabulary in text
 */

export interface FlashcardVocab {
  word: string;
  meaning: string;
}

export interface ParsedSegment {
  type: "text" | "vocab";
  content: string;
  meaning?: string; // Only for vocab type
}

/**
 * Parse text and identify flashcard vocabulary
 * Returns segments with marked vocabulary
 */
export function parseVocabularyInText(
  text: string,
  flashcards: FlashcardVocab[]
): ParsedSegment[] {
  if (flashcards.length === 0) {
    return [{ type: "text", content: text }];
  }

  // Strip markdown syntax before parsing
  const cleanText = text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **bold**
    .replace(/\*(.+?)\*/g, '$1');      // *italic*

  const segments: ParsedSegment[] = [];
  let currentIndex = 0;

  // Create regex pattern for all flashcard words (case-insensitive, word boundaries)
  const vocabPattern = flashcards
    .map((f) => f.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special chars
    .join("|");

  const regex = new RegExp(`\\b(${vocabPattern})\\b`, "gi");

  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleanText)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    // Add text before match
    if (matchStart > currentIndex) {
      segments.push({
        type: "text",
        content: cleanText.slice(currentIndex, matchStart),
      });
    }

    // Find the flashcard for this match
    const matchedWord = match[0];
    const flashcard = flashcards.find(
      (f) => f.word.toLowerCase() === matchedWord.toLowerCase()
    );

    // Add vocabulary segment
    if (flashcard) {
      segments.push({
        type: "vocab",
        content: matchedWord,
        meaning: flashcard.meaning,
      });
    }

    currentIndex = matchEnd;
  }

  // Add remaining text
  if (currentIndex < cleanText.length) {
    segments.push({
      type: "text",
      content: cleanText.slice(currentIndex),
    });
  }

  return segments;
}

/**
 * Build flashcard vocabulary list from flashcard data
 */
export function buildFlashcardVocabulary(
  flashcards: Array<{ front: string; back: string }>
): FlashcardVocab[] {
  return flashcards.map((f) => ({
    word: f.front,
    meaning: f.back,
  }));
}
