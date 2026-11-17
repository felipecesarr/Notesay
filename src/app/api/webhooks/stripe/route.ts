import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/meetmate/services/stripe/stripe";
import { prisma } from "@/meetmate/services/db/prisma";

// Helper to safely get subscription period timestamps
/* eslint-disable @typescript-eslint/no-explicit-any */
const getSubscriptionDates = (sub: any) => ({
  periodStart: new Date((sub.current_period_start as number) * 1000),
  periodEnd: new Date((sub.current_period_end as number) * 1000),
  canceledAt: sub.canceled_at ? new Date((sub.canceled_at as number) * 1000) : null,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function POST(req: Request) {
  // Check webhook secret is configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.error("❌ No stripe-signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  void 0;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        void 0;
        break;
      }

      default:
        void 0;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:");
    // Return 200 anyway to prevent Stripe from retrying
    // Log the error for investigation but don't block
    return NextResponse.json({ received: true, warning: "Handler had error but acknowledged" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("⚠️ No userId in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!subscriptionId) {
    console.error("⚠️ No subscription in checkout session (one-time payment?)");
    return;
  }

  try {
    // Get full subscription details
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price?.id;
    const dates = getSubscriptionDates(sub);

    if (!priceId) {
      console.error("⚠️ No price ID found in subscription");
      return;
    }

    // Update User table
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: dates.periodEnd,
      },
    });

    // Create/Update UserSubscription record
    await prisma.userSubscription.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        status: sub.status,
        plan: "monthly",
        priceId: priceId,
        currentPeriodStart: dates.periodStart,
        currentPeriodEnd: dates.periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
      },
      update: {
        status: sub.status,
        stripePriceId: priceId,
        currentPeriodStart: dates.periodStart,
        currentPeriodEnd: dates.periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
      },
    });

    void 0;
  } catch (error) {
    console.error("Notesay operation failed.");
    throw error;
  }
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  const dates = getSubscriptionDates(sub);

  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      void 0;
      return;
    }

    const priceId = sub.items.data[0]?.price?.id;
    if (!priceId) {
      console.error("⚠️ No price ID in subscription update");
      return;
    }

    await prisma.userSubscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        status: sub.status,
        plan: "monthly",
        priceId: priceId,
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: dates.periodEnd,
      },
    });

    void 0;
  } catch (error) {
    console.error("Notesay operation failed.");
    throw error;
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;

  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      void 0;
      return;
    }

    // Use upsert to handle case where subscription record doesn't exist
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
    });

    if (existingSubscription) {
      await prisma.userSubscription.update({
        where: { userId: user.id },
        data: {
          status: "canceled",
          canceledAt: new Date(),
        },
      });
      void 0;
    } else {
      void 0;
    }
  } catch (error) {
    console.error("Notesay operation failed.");
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      // This is normal for first payment - checkout.session.completed handles it
      void 0;
      return;
    }

    void 0;
  } catch (error) {
    console.error("Notesay operation failed.");
    // Don't throw - this is non-critical
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      void 0;
      return;
    }

    // Check if subscription exists before updating
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
    });

    if (existingSubscription) {
      await prisma.userSubscription.update({
        where: { userId: user.id },
        data: { status: "past_due" },
      });
      void 0;
    } else {
      void 0;
    }
  } catch (error) {
    console.error("Notesay operation failed.");
    // Don't throw - we still want to acknowledge the webhook
  }
}
