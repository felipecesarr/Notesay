
"use server";

import { auth } from "@/features/auth/controller/auth";
import { prisma } from "@/meetmate/services/db/prisma";
import { stripe, STRIPE_PLANS, type StripePlan } from "@/meetmate/services/stripe/stripe";
import { headers } from "next/headers";
import { syncUserSubscription } from "@/features/subscription/utils/sync-subscription";


/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(plan: StripePlan) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const planConfig = STRIPE_PLANS[plan];
    if (!planConfig.priceId) {
      return { success: false, error: "Invalid plan configuration" };
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Check if user has ever had a subscription (no trial for returning users)
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
    });
    const isFirstSubscription = !existingSubscription;

    // Create checkout session
    // Use NEXT_PUBLIC_APP_URL (which should be set differently in dev vs prod)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true, // Enable coupon/promo codes for partners/UGC
      subscription_data: {
        // Only offer 7-day trial for first-time subscribers
        ...(isFirstSubscription && { trial_period_days: 7 }),
        metadata: {
          userId: user.id,
          plan: plan,
        },
      },
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan,
      },
    });

    if (!checkoutSession.url) {
      return { success: false, error: "Failed to create checkout session" };
    }

    return { success: true, url: checkoutSession.url };
  } catch (error) {
    console.error("Error creating checkout session:");
    return { success: false, error: "Failed to create checkout session" };
  }
}

/**
 * Create a Stripe customer portal session
 */
export async function createPortalSession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return { success: false, error: "No subscription found" };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return { success: true, url: portalSession.url };
  } catch (error) {
    console.error("Error creating portal session:");
    return { success: false, error: "Failed to create portal session" };
  }
}

/**
 * Get user's subscription status
 * Syncs with Stripe first to ensure data is up to date
 */
export async function getSubscriptionStatus() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sync with Stripe before checking status
    await syncUserSubscription();

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    });

    return {
      success: true,
      subscription: subscription || null,
      isActive: subscription?.status === "active",
      isTrialing: subscription?.status === "trialing",
      isPastDue: subscription?.status === "past_due",
      isCanceled: subscription?.cancelAtPeriodEnd || false,
    };
  } catch (error) {
    console.error("Error getting subscription status:");
    return { success: false, error: "Failed to get subscription status" };
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return { success: false, error: "No active subscription" };
    }

    // Cancel at period end in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    await prisma.userSubscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:");
    return { success: false, error: "Failed to cancel subscription" };
  }
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return { success: false, error: "No subscription found" };
    }

    // Resume subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update database
    await prisma.userSubscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resuming subscription:");
    return { success: false, error: "Failed to resume subscription" };
  }
}
