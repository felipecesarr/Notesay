// src/meetmate/services/token-tracking/types.ts

export type Feature =
  | 'chat'
  | 'interview'
  | 'quiz'
  | 'video-understanding'
  | 'file-search'
  | 'read-aloud'
  | 'skills'
  | 'notes'
  | 'feedback'
  | 'youtube-study'
  | 'pdf-processing'
  | 'context-processing';

export interface TokenUsageData {
  userId: string;
  feature: Feature;
  action: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  latencyMs?: number;
  requestId?: string;
}

export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

// Helper type para response do Gemini
export interface GeminiResponse {
  response?: {
    usageMetadata?: GeminiUsageMetadata;
    text: () => string;
  };
  usageMetadata?: GeminiUsageMetadata;
}
