export interface CreateFlashcardDTO {
  front: string;
  back: string;
  context?: string;
  tense?: string;
  phonetic?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  context?: string | null;
  tense?: string | null;
  phonetic?: string | null;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardResponse {
  success: boolean;
  flashcard?: Flashcard;
  flashcards?: Flashcard[];
  error?: string;
}
