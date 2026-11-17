"use server";

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";

/**
 * Resultado da verificacao de admin
 */
export interface AdminInfo {
  userId: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Verifica se o usuario atual e admin
 *
 * @returns true se o usuario e admin, false caso contrario
 *
 * @example
 * ```typescript
 * const adminStatus = await isAdmin();
 * if (!adminStatus) {
 *   redirect("/");
 * }
 * ```
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.email) {
      return false;
    }

    const adminEmail = await prisma.adminEmail.findUnique({
      where: { email: session.user.email },
    });

    return !!adminEmail;
  } catch (error) {
    console.error("[AdminGuard] Error checking admin status:");
    return false;
  }
}

/**
 * Requer que o usuario seja admin
 * Lanca erro se nao for admin
 *
 * @returns Informacoes do admin
 * @throws Error se usuario nao for admin
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   try {
 *     const admin = await requireAdmin();
 *     // usuario e admin, continuar...
 *   } catch (error) {
 *     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *   }
 * }
 * ```
 */
export async function requireAdmin(): Promise<AdminInfo> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const adminEmail = await prisma.adminEmail.findUnique({
    where: { email: session.user.email },
  });

  if (!adminEmail) {
    throw new Error("Admin access required");
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: adminEmail.name,
    role: adminEmail.role,
  };
}

/**
 * Verifica se o usuario atual e super admin
 * Super admins tem permissoes elevadas (ex: gerenciar outros admins)
 *
 * @returns true se super admin, false caso contrario
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.email) {
      return false;
    }

    const adminEmail = await prisma.adminEmail.findUnique({
      where: { email: session.user.email },
    });

    return adminEmail?.role === 'super_admin';
  } catch (error) {
    console.error("[AdminGuard] Error checking super admin status:");
    return false;
  }
}

/**
 * Requer que o usuario seja super admin
 *
 * @returns Informacoes do super admin
 * @throws Error se usuario nao for super admin
 */
export async function requireSuperAdmin(): Promise<AdminInfo> {
  const admin = await requireAdmin();

  if (admin.role !== 'super_admin') {
    throw new Error("Super admin access required");
  }

  return admin;
}

/**
 * Obtem informacoes do admin atual (se for admin)
 *
 * @returns AdminInfo ou null se nao for admin
 */
export async function getAdminInfo(): Promise<AdminInfo | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.email) {
      return null;
    }

    const adminEmail = await prisma.adminEmail.findUnique({
      where: { email: session.user.email },
    });

    if (!adminEmail) {
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      name: adminEmail.name,
      role: adminEmail.role,
    };
  } catch (error) {
    console.error("[AdminGuard] Error getting admin info:");
    return null;
  }
}

// ============================================
// FUNCOES DE GERENCIAMENTO (para super admins)
// ============================================

/**
 * Lista todos os emails de admin
 * Requer super_admin
 */
export async function listAdminEmails(): Promise<{
  success: boolean;
  admins?: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    await requireSuperAdmin();

    const admins = await prisma.adminEmail.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, admins };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list admins",
    };
  }
}

/**
 * Adiciona um novo email de admin
 * Requer super_admin
 */
export async function addAdminEmail(
  email: string,
  name?: string,
  role: 'admin' | 'super_admin' = 'admin'
): Promise<{
  success: boolean;
  admin?: { id: string; email: string; role: string };
  error?: string;
}> {
  try {
    await requireSuperAdmin();

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Verificar se ja existe
    const existing = await prisma.adminEmail.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "Email already exists as admin" };
    }

    const admin = await prisma.adminEmail.create({
      data: { email, name, role },
    });

    return {
      success: true,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add admin",
    };
  }
}

/**
 * Remove um email de admin
 * Requer super_admin
 * Nao pode remover a si mesmo
 */
export async function removeAdminEmail(
  emailToRemove: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentAdmin = await requireSuperAdmin();

    // Nao permitir remover a si mesmo
    if (currentAdmin.email === emailToRemove) {
      return { success: false, error: "Cannot remove yourself" };
    }

    await prisma.adminEmail.delete({
      where: { email: emailToRemove },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove admin",
    };
  }
}
