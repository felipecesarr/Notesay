// Script to sync subscription data from Stripe to database
// Run with: npx tsx scripts/sync-subscription.ts <userId>

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion,
});

async function syncSubscription(userId?: string) {
  void 0;

  // Get users with Stripe subscriptions
  const whereClause = userId 
    ? { id: userId, stripeSubscriptionId: { not: null } }
    : { stripeSubscriptionId: { not: null } };

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
    },
  });

  void 0;

  for (const user of users) {
    void 0;
    void 0;

    try {
      // Fetch current subscription from Stripe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId!) as any;
      
      void 0;
      void 0;
      void 0;

      const priceId = sub.items.data[0]?.price?.id;

      // Update UserSubscription
      await prisma.userSubscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: user.stripeCustomerId!,
          stripePriceId: priceId || "",
          status: sub.status,
          plan: "monthly",
          priceId: priceId || "",
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
        update: {
          status: sub.status,
          stripePriceId: priceId || "",
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        },
      });

      // Update User table too
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          stripePriceId: priceId,
        },
      });

      void 0;

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        void 0;
        
        // If subscription doesn't exist in Stripe, mark as canceled
        if (error.code === "resource_missing") {
          await prisma.userSubscription.updateMany({
            where: { userId: user.id },
            data: { status: "canceled" },
          });
          void 0;
        }
      } else {
        void 0;
      }
    }
  }

  void 0;
  await prisma.$disconnect();
}

// Run the script
const userId = process.argv[2];
syncSubscription(userId).catch(() => console.error("Notesay operation failed."));
