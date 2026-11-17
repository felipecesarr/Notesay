import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/utils";
import { prisma } from "@/meetmate/services/db/prisma";

/**
 * GET /api/admin/tokens
 *
 * Lista uso de tokens com paginacao e filtros
 *
 * Query params:
 * - page: numero da pagina (default: 1)
 * - limit: itens por pagina (default: 50, max: 100)
 * - userId: filtrar por usuario
 * - feature: filtrar por feature
 * - startDate: data inicial (ISO string)
 * - endDate: data final (ISO string)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar admin
    const admin = await requireAdmin();
    void 0;

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const userId = searchParams.get("userId");
    const feature = searchParams.get("feature");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtro
    const where: {
      userId?: string;
      feature?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (userId) {
      where.userId = userId;
    }

    if (feature) {
      where.feature = feature;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Executar queries em paralelo
    const [total, usages] = await Promise.all([
      prisma.tokenUsage.count({ where }),
      prisma.tokenUsage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      usages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[AdminTokens] Error:");

    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" || message === "Admin access required"
      ? 401
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
