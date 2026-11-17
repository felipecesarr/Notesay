// src/app/api/cron/aggregate-tokens/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  aggregateDailyUsage,
  cleanupOldUsageData
} from "@/meetmate/services/token-tracking";

// Configuracao para Vercel
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos max

/**
 * GET /api/cron/aggregate-tokens
 *
 * Endpoint para cron job de agregacao diaria
 *
 * Autenticacao:
 * - Vercel Cron: header x-vercel-cron
 * - Manual: Bearer token com CRON_SECRET
 *
 * Query params:
 * - cleanup: "true" para tambem limpar dados antigos
 * - retentionDays: dias para manter (default: 90)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verificar autorizacao
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Verificar se e chamada do Vercel Cron ou tem secret valido
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !hasValidSecret) {
      console.warn("[CronAggregateTokens] Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    void 0;

    // Executar agregacao
    const aggregationResult = await aggregateDailyUsage();

    // Verificar se deve fazer cleanup
    const searchParams = request.nextUrl.searchParams;
    const shouldCleanup = searchParams.get("cleanup") === "true";
    let cleanupResult = null;

    if (shouldCleanup) {
      const retentionDays = parseInt(searchParams.get("retentionDays") || "90");
      cleanupResult = await cleanupOldUsageData(retentionDays);
    }

    const totalDuration = Date.now() - startTime;

    return NextResponse.json({
      success: aggregationResult.success,
      aggregation: aggregationResult,
      cleanup: cleanupResult,
      timestamp: new Date().toISOString(),
      totalDuration: `${totalDuration}ms`,
    });
  } catch (error) {
    console.error("[CronAggregateTokens] Unexpected error:");

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
