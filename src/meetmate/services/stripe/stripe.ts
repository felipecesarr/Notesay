import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // @ts-expect-error - Using specific API version not yet in types
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

// Stripe Price ID - Monthly Plan only
export const MONTHLY_PRICE = {
  priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "",
  amount: 20.00,
  currency: "USD",
  interval: "month" as const,
  name: "Notesay AI Monthly",
  description: "Full access to Notesay AI features",
};

// For backwards compatibility
export const STRIPE_PLANS = {
  MONTHLY: MONTHLY_PRICE,
} as const;

export type StripePlan = "MONTHLY";
