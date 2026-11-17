"use server";

import { auth } from "@/features/auth/controller/auth";
import { stripe } from "@/meetmate/services/stripe/stripe";
import { prisma } from "@/meetmate/services/db/prisma";
import { headers } from "next/headers";

// Helper to safely get subscription period timestamps (same as webhook)
/* eslint-disable @typescript-eslint/no-explicit-any */
const getSubscriptionDates = (sub: any) => ({
  periodStart: new Date((sub.current_period_start as number) * 1000),
  periodEnd: new Date((sub.current_period_end as number) * 1000),
});
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Sync user subscription data from Stripe to database
 * Call this before checking subscription status to ensure data is up to date
 */
export async function syncUserSubscription(): Promise<{
  success: boolean;
  synced: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, synced: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, stripeCustomerId: true },
    });

    if (!user) {
      return { success: false, synced: false, error: "User not found" };
    }

    // If user has no Stripe customer ID, nothing to sync
    if (!user.stripeCustomerId) {
      return { success: true, synced: false };
    }

    // Fetch all subscriptions from Stripe (active, past_due, canceled)
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      // No subscription in Stripe - mark as canceled if exists in DB
      const existingSubscription = await prisma.userSubscription.findUnique({
        where: { userId: user.id },
      });

      if (existingSubscription && existingSubscription.status !== "canceled") {
        await prisma.userSubscription.update({
          where: { userId: user.id },
          data: { status: "canceled" },
        });
        void 0;
      }

      return { success: true, synced: true };
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0]?.price?.id;
    const dates = getSubscriptionDates(sub);

    // Update UserSubscription table
    await prisma.userSubscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: user.stripeCustomerId,
        stripePriceId: priceId || "",
        status: sub.status,
        plan: "monthly",
        priceId: priceId || "",
        currentPeriodStart: dates.periodStart,
        currentPeriodEnd: dates.periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      update: {
        status: sub.status,
        stripePriceId: priceId,
        currentPeriodStart: dates.periodStart,
        currentPeriodEnd: dates.periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    });

    // Update User table
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: dates.periodEnd,
      },
    });

    void 0;

    return { success: true, synced: true };
  } catch (error) {
    console.error("❌ Error syncing subscription:");
    return { success: false, synced: false, error: "Failed to sync subscription" };
  }
}
