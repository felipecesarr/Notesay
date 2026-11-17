// src/meetmate/services/token-tracking/wrapper.ts

import { trackTokenUsage, extractTokenMetadata } from "./tracker";
import type { Feature } from "./types";

interface TrackedCallOptions {
  userId: string;
  feature: Feature;
  action: string;
  model: string;
}

/**
 * Wrapper que executa chamada Gemini e rastreia tokens automaticamente
 *
 * @example
 * ```typescript
 * const result = await withTokenTracking(
 *   () => model.generateContent(prompt),
 *   {
 *     userId: session.user.id,
 *     feature: 'chat',
 *     action: 'sendMessage',
 *     model: 'gemini-2.5-flash'
 *   }
 * );
 * ```
 */
export async function withTokenTracking<T>(
  geminiCall: () => Promise<T>,
  options: TrackedCallOptions
): Promise<T> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Executar chamada Gemini
    const result = await geminiCall();
    const latencyMs = Date.now() - startTime;

    // Extrair tokens da resposta
    const tokens = extractTokenMetadata(result);

    // Track em background (fire-and-forget)
    trackTokenUsage({
      userId: options.userId,
      feature: options.feature,
      action: options.action,
      model: options.model,
      requestId,
      latencyMs,
      ...tokens,
    });

    return result;
  } catch (error) {
    // Track chamadas que falharam tambem (para monitoramento)
    trackTokenUsage({
      userId: options.userId,
      feature: options.feature,
      action: `${options.action}_error`,
      model: options.model,
      requestId,
      latencyMs: Date.now() - startTime,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    });

    throw error;
  }
}

/**
 * Helper para gerar requestId unico
 * Util quando precisa correlacionar logs
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}
