"use server";

import { auth } from "@/features/auth/controller/auth";
import { prisma } from "@/meetmate/services/db/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { syncUserSubscription } from "./sync-subscription";

/**
 * Check if user has an active subscription
 * Syncs with Stripe first, then redirects to /subscribe if not active
 */
export async function requireSubscription() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/");
  }

  // Sync with Stripe before checking status
  await syncUserSubscription();

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId: session.user.id },
  });

  // Check if subscription is active or trialing
  if (subscription?.status !== "active" && subscription?.status !== "trialing") {
    redirect("/subscribe");
  }

  return true;
}

/**
 * Check if user has active subscription (returns boolean)
 * Syncs with Stripe first to ensure data is up to date
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    void 0;

    if (!session?.user) {
      void 0;
      return false;
    }

    // Sync with Stripe before checking status
    await syncUserSubscription();

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    });

    void 0;

    if (!subscription) {
      void 0;
      return false;
    }

    // Check if subscription is active or trialing
    const isActive = subscription.status === "active" || subscription.status === "trialing";

    void 0;

    return isActive;
  } catch (error) {
    console.error("Error checking subscription:");
    return false;
  }
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return null;
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    });

    return subscription;
  } catch (error) {
    console.error("Error getting subscription:");
    return null;
  }
}

/**
 * Gate premium features
 */
export async function canAccessPremiumFeatures(): Promise<boolean> {
  return hasActiveSubscription();
}
