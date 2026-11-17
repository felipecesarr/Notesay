"use client";

import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession } from "../controller";

const FEATURES = [
  "Unlimited AI conversations",
  "6 conversation modes (Chill, Teacher, Formal, etc.)",
  "Smart vocabulary revival with spaced repetition",
  "Unlimited flashcards",
  "YouTube video practice",
  "Read-aloud & shadowing exercises",
  "Interview preparation",
  "Priority support",
];

export function PricingPlans() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const result = await createCheckoutSession("MONTHLY");
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "Failed to create checkout session");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating checkout:");
      alert("Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-stone-900 mb-4">
            Start Learning English Smarter
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Get full access to Notesay AI&apos;s powerful features. Cancel anytime.
          </p>
        </div>

        {/* Single Plan Card */}
        <div className="max-w-md mx-auto">
          <div className="relative bg-white rounded-3xl border-2 border-violet-500 shadow-2xl p-8 transform hover:scale-105 transition-transform">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-violet-500 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </div>

            {/* Plan Header */}
            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                Notesay AI Premium
              </h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-stone-900">
                  $20
                </span>
                <span className="text-xl text-stone-500">/month</span>
              </div>
              <p className="text-sm text-stone-500">
                Billed monthly • Cancel anytime
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-stone-700 mb-4 uppercase tracking-wide">
                Everything you need:
              </p>
              <ul className="space-y-3">
                {FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="shrink-0 w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-[#1b5f4a]" />
                    </div>
                    <span className="text-stone-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 px-6 bg-linear-to-r from-[#dfecc8] to-[#1b5f4a] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Your Subscription"
              )}
            </button>

            {/* Trust Signals */}
            <div className="mt-6 text-center">
              <p className="text-sm text-emerald-600 font-semibold mb-2">
                Start with a 7-day free trial
              </p>
              <p className="text-xs text-stone-500 mb-2">
                🔒 Secure payment by Stripe
              </p>
              <p className="text-xs text-stone-500">
                ✨ No commitment • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-stone-900 mb-6">
            Why Notesay AI?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-stone-900 mb-2">Personalized</h4>
              <p className="text-sm text-stone-600">
                AI adapts to your level and learning style
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-semibold text-stone-900 mb-2">Smart</h4>
              <p className="text-sm text-stone-600">
                Spaced repetition ensures you never forget
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-stone-900 mb-2">Efficient</h4>
              <p className="text-sm text-stone-600">
                Learn faster with AI-powered practice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
