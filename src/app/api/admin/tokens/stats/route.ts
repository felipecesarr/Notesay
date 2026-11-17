import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/utils";
import { prisma } from "@/meetmate/services/db/prisma";

/**
 * GET /api/admin/tokens/stats
 *
 * Retorna estatisticas agregadas de uso de tokens
 *
 * Query params:
 * - days: periodo em dias (default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    void 0;

    const searchParams = request.nextUrl.searchParams;
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get("days") || "30")));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Executar queries em paralelo
    const [totalStats, featureStats, modelStats, dailyStats] = await Promise.all([
      // Total geral
      prisma.tokenUsage.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: {
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
        },
        _count: { id: true },
        _avg: { latencyMs: true },
      }),

      // Por feature
      prisma.tokenUsage.groupBy({
        by: ['feature'],
        where: { createdAt: { gte: startDate } },
        _sum: {
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
        },
        _count: { id: true },
        _avg: { latencyMs: true },
        orderBy: { _sum: { totalTokens: 'desc' } },
      }),

      // Por modelo
      prisma.tokenUsage.groupBy({
        by: ['model'],
        where: { createdAt: { gte: startDate } },
        _sum: { totalTokens: true },
        _count: { id: true },
        orderBy: { _sum: { totalTokens: 'desc' } },
      }),

      // Por dia (usando agregacao diaria se existir dados)
      prisma.tokenUsageDaily.groupBy({
        by: ['date'],
        where: { date: { gte: startDate } },
        _sum: {
          totalRequests: true,
          totalTokens: true,
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Formatar resposta
    return NextResponse.json({
      total: {
        requests: totalStats._count.id,
        promptTokens: totalStats._sum.promptTokens || 0,
        completionTokens: totalStats._sum.completionTokens || 0,
        totalTokens: totalStats._sum.totalTokens || 0,
        avgLatencyMs: Math.round(totalStats._avg.latencyMs || 0),
      },
      byFeature: featureStats.map(f => ({
        feature: f.feature,
        requests: f._count.id,
        promptTokens: f._sum.promptTokens || 0,
        completionTokens: f._sum.completionTokens || 0,
        totalTokens: f._sum.totalTokens || 0,
        avgLatencyMs: Math.round(f._avg.latencyMs || 0),
      })),
      byModel: modelStats.map(m => ({
        model: m.model,
        requests: m._count.id,
        totalTokens: m._sum.totalTokens || 0,
      })),
      daily: dailyStats.map(d => ({
        date: d.date,
        requests: d._sum.totalRequests || 0,
        totalTokens: d._sum.totalTokens || 0,
      })),
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[AdminTokenStats] Error:");

    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Admin access required"
      ? 401
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
