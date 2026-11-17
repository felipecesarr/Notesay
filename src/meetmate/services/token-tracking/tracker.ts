// src/meetmate/services/token-tracking/tracker.ts

import { prisma } from "@/meetmate/services/db/prisma";
import type { TokenUsageData, GeminiResponse } from "./types";

export function trackTokenUsage(data: TokenUsageData): void {
  prisma.tokenUsage.create({
    data: {
      userId: data.userId,
      feature: data.feature,
      action: data.action,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens: data.totalTokens,
      model: data.model,
      latencyMs: data.latencyMs,
      requestId: data.requestId,
    },
  }).then(() => {
    void 0;
  }).catch((error) => {
    // Log mas NAO throw - tracking nao deve afetar UX
    console.error("[TokenTracking] Failed to save usage:");
  });
}


export async function trackTokenUsageSync(data: TokenUsageData): Promise<boolean> {
  try {
    await prisma.tokenUsage.create({
      data: {
        userId: data.userId,
        feature: data.feature,
        action: data.action,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        model: data.model,
        latencyMs: data.latencyMs,
        requestId: data.requestId,
      },
    });
    return true;
  } catch (error) {
    console.error("[TokenTracking] Sync save failed:");
    return false;
  }
}

export function extractTokenMetadata(response: unknown): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
} {
  const defaultResult = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  if (!response || typeof response !== 'object') {
    return defaultResult;
  }

  const resp = response as GeminiResponse;

  // Tentar extrair de response.usageMetadata primeiro
  let usage = resp.response?.usageMetadata;

  // Fallback para usageMetadata direto
  if (!usage) {
    usage = resp.usageMetadata;
  }

  if (!usage) {
    console.warn("[TokenTracking] No usageMetadata found in response");
    return defaultResult;
  }

  return {
    promptTokens: usage.promptTokenCount || 0,
    completionTokens: usage.candidatesTokenCount || 0,
    totalTokens: usage.totalTokenCount || 0,
  };
}
