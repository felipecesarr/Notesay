type TextSize = 'small' | 'medium' | 'large';

const SIZE_CONFIG = {
  small: { words: 300, description: 'Quick practice' },
  medium: { words: 600, description: 'Standard practice' },
  large: { words: 1000, description: 'Deep practice' }
};

/**
 * Normalizes text for comparison by removing punctuation and converting to lowercase
 * Pure function - same input always produces same output
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[.,!?;:]/g, "").trim();
}

/**
 * Calculates accuracy percentage between expected and actual text
 * Pure function - deterministic word matching algorithm
 */
export function calculateAccuracy(expected: string, actual: string): number {
  const expectedWords = expected.split(/\s+/);
  const actualWords = actual.split(/\s+/);
  const correct = actualWords.filter(w => expectedWords.includes(w)).length;
  return Math.round((correct / expectedWords.length) * 100);
}

export function buildPracticeTextPrompt(
  topics: string[], 
  size: TextSize, 
  words: string[]
): string {
  const wordCount = SIZE_CONFIG[size].words;
  const topicBlend = topics.length === 2 
    ? `${topics[0]} AND ${topics[1]}` 
    : topics[0];

  return `
You are an expert English language teacher creating practice materials.

Task: Write an engaging practice text of EXACTLY ${wordCount} words that blends these topics: "${topicBlend}".

Requirements:
1. Naturally incorporate these vocabulary words: ${words.join(", ")}.
2. Level: Intermediate (B1/B2).
3. Tone: Conversational and informative.
4. Structure: 2-3 clear paragraphs with natural thought groups.
5. Make connections between the topics if multiple provided.
6. Use varied sentence structures for pronunciation practice.

Output Format (MUST be valid JSON):
{
  "title": "An engaging title that references both topics",
  "content": "The complete text here with proper punctuation and flow..."
}
  `.trim();
}
