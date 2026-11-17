// src/meetmate/services/token-tracking/aggregator.ts

import { prisma } from "@/meetmate/services/db/prisma";

interface AggregationResult {
  success: boolean;
  date: string;
  aggregatedRecords: number;
  error?: string;
  duration?: number;
}

/**
 * Agrega dados diarios de token usage
 *
 * Esta funcao:
 * 1. Busca todos os registros de TokenUsage do dia anterior
 * 2. Agrupa por userId + feature + model
 * 3. Cria/atualiza registros em TokenUsageDaily
 *
 * A funcao e idempotente - pode ser executada multiplas vezes
 * para o mesmo dia sem duplicar dados (usa upsert).
 *
 * @param date - Data para agregar (default: hoje, agrega dia anterior)
 */
export async function aggregateDailyUsage(
  date: Date = new Date()
): Promise<AggregationResult> {
  const startTime = Date.now();

  // Normalizar para inicio do dia anterior (UTC)
  const targetDate = new Date(date);
  targetDate.setUTCDate(targetDate.getUTCDate() - 1);
  targetDate.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const dateString = targetDate.toISOString().split('T')[0];

  void 0;

  try {
    // Agregar por userId + feature + model
    const aggregations = await prisma.tokenUsage.groupBy({
      by: ['userId', 'feature', 'model'],
      where: {
        createdAt: {
          gte: targetDate,
          lt: endOfDay,
        },
      },
      _count: { id: true },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
      },
      _avg: {
        latencyMs: true,
      },
    });

    void 0;

    if (aggregations.length === 0) {
      return {
        success: true,
        date: dateString,
        aggregatedRecords: 0,
        duration: Date.now() - startTime,
      };
    }

    // Upsert cada agregacao em transacao
    await prisma.$transaction(
      aggregations.map((agg) =>
        prisma.tokenUsageDaily.upsert({
          where: {
            userId_date_feature_model: {
              userId: agg.userId,
              date: targetDate,
              feature: agg.feature,
              model: agg.model,
            },
          },
          create: {
            userId: agg.userId,
            date: targetDate,
            feature: agg.feature,
            model: agg.model,
            totalRequests: agg._count.id,
            totalPromptTokens: agg._sum.promptTokens || 0,
            totalCompletionTokens: agg._sum.completionTokens || 0,
            totalTokens: agg._sum.totalTokens || 0,
            avgLatencyMs: agg._avg.latencyMs
              ? Math.round(agg._avg.latencyMs)
              : null,
          },
          update: {
            totalRequests: agg._count.id,
            totalPromptTokens: agg._sum.promptTokens || 0,
            totalCompletionTokens: agg._sum.completionTokens || 0,
            totalTokens: agg._sum.totalTokens || 0,
            avgLatencyMs: agg._avg.latencyMs
              ? Math.round(agg._avg.latencyMs)
              : null,
          },
        })
      )
    );

    const duration = Date.now() - startTime;
    void 0;

    return {
      success: true,
      date: dateString,
      aggregatedRecords: aggregations.length,
      duration,
    };
  } catch (error) {
    console.error("[Aggregator] Error:");

    return {
      success: false,
      date: dateString,
      aggregatedRecords: 0,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Agrega multiplos dias de uma vez
 * Util para backfill de dados historicos
 *
 * @param startDate - Data inicial
 * @param endDate - Data final (inclusive)
 */
export async function aggregateRange(
  startDate: Date,
  endDate: Date
): Promise<AggregationResult[]> {
  const results: AggregationResult[] = [];
  const currentDate = new Date(startDate);

  // Adicionar 1 dia porque aggregateDailyUsage processa o dia anterior
  currentDate.setUTCDate(currentDate.getUTCDate() + 1);

  const finalDate = new Date(endDate);
  finalDate.setUTCDate(finalDate.getUTCDate() + 1);

  while (currentDate <= finalDate) {
    const result = await aggregateDailyUsage(currentDate);
    results.push(result);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return results;
}

/**
 * Limpa dados antigos de TokenUsage (detalhados)
 * Mantem apenas os ultimos N dias de dados detalhados
 *
 * @param retentionDays - Dias para manter (default: 90)
 */
export async function cleanupOldUsageData(
  retentionDays: number = 90
): Promise<{ deletedCount: number }> {
  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - retentionDays);
  cutoffDate.setUTCHours(0, 0, 0, 0);

  void 0;

  const result = await prisma.tokenUsage.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  void 0;

  return { deletedCount: result.count };
}
