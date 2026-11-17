export function extractYouTubeVideoId(url: string): string | null {
  const pattern = /(?:v=|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function buildVideoAnalysisPrompt(): string {
  return `You are a precise transcript extractor. Extract the COMPLETE transcript from the provided YouTube video with accurate timestamps.

IMPORTANT: You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations - just pure JSON.

Required JSON structure:
{
  "title": "video title",
  "summary": "brief summary in 2-3 sentences",
  "content": "complete transcript with timestamps"
}

CRITICAL RULES for the "content" field:
1. MUST include EVERY spoken word from the video - do not skip or summarize
2. Each phrase/sentence MUST start with its timestamp: [MM:SS] or [HH:MM:SS]
3. Timestamps should be accurate to when words are spoken
4. Place timestamps every 5-15 seconds for optimal practice chunks
5. Keep the exact words spoken - do not paraphrase or translate

Example format:
"[00:00] Welcome to this video. [00:05] Today we're going to explore JavaScript. [00:12] Let's start with the fundamentals. [00:18] First, what is JavaScript?"

VALIDATION CHECKLIST before responding:
✓ Is your response ONLY valid JSON? (no markdown formatting)
✓ Does "content" contain the COMPLETE transcript?
✓ Does every sentence start with [MM:SS] or [HH:MM:SS]?
✓ Are timestamps accurate and frequent?
✓ Are these the actual spoken words?

Respond with ONLY the JSON object.`.trim();
}
