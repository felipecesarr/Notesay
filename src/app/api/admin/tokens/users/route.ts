import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/utils";
import { prisma } from "@/meetmate/services/db/prisma";

/**
 * GET /api/admin/tokens/users
 *
 * Retorna ranking de usuarios por consumo de tokens
 *
 * Query params:
 * - limit: numero de usuarios (default: 10, max: 50)
 * - days: periodo em dias (default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    void 0;

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get("days") || "30")));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Top usuarios por consumo de tokens
    const topUsers = await prisma.tokenUsage.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startDate } },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
      },
      _count: { id: true },
      _avg: { latencyMs: true },
      orderBy: { _sum: { totalTokens: 'desc' } },
      take: limit,
    });

    // Buscar detalhes dos usuarios
    const userIds = topUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    const usersMap = new Map(users.map(u => [u.id, u]));

    // Formatar resposta com ranking
    const result = topUsers.map((u, index) => {
      const user = usersMap.get(u.userId);
      return {
        rank: index + 1,
        userId: u.userId,
        email: user?.email || 'Unknown',
        name: user?.name || null,
        image: user?.image || null,
        userCreatedAt: user?.createdAt || null,
        requests: u._count.id,
        promptTokens: u._sum.promptTokens || 0,
        completionTokens: u._sum.completionTokens || 0,
        totalTokens: u._sum.totalTokens || 0,
        avgLatencyMs: Math.round(u._avg.latencyMs || 0),
      };
    });

    // Calcular total geral para contexto
    const grandTotal = await prisma.tokenUsage.aggregate({
      where: { createdAt: { gte: startDate } },
      _sum: { totalTokens: true },
    });

    return NextResponse.json({
      topUsers: result,
      summary: {
        totalUsersWithUsage: topUsers.length,
        grandTotalTokens: grandTotal._sum.totalTokens || 0,
        topUserPercentage: topUsers[0]
          ? Math.round(((topUsers[0]._sum.totalTokens || 0) / (grandTotal._sum.totalTokens || 1)) * 100)
          : 0,
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[AdminTokenUsers] Error:");

    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Admin access required"
      ? 401
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
