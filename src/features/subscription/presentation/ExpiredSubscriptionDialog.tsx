"use client";

import React, { useState } from "react";
import { Loader2, CreditCard, LogOut } from "lucide-react";
import { createCheckoutSession, createPortalSession } from "../controller";
import { signOut } from "@/features/auth/presentation/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ExpiredSubscriptionDialogProps {
  open: boolean;
  isPastDue?: boolean; // Payment failed vs canceled
}

export function ExpiredSubscriptionDialog({ open, isPastDue = false }: ExpiredSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRenew = async () => {
    setLoading(true);
    
    try {
      const result = await createCheckoutSession("MONTHLY");
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:");
      alert("Failed to start checkout");
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setLoading(true);
    
    try {
      const result = await createPortalSession();
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "Failed to open billing portal");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:");
      alert("Failed to open billing portal");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!open) return null;

  return (
    <div className="w-[95%] h-[95%] md:w-[45%] md:h-[85%] relative p-4 md:p-6 flex flex-col justify-between items-center overflow-hidden rounded-3xl shadow-2xl">
      {/* Gradient background - More urgent (red tones) */}
      <div className="absolute inset-0 bg-linear-to-b from-[#FFB085] via-[#FFE6E6] to-[#FFB4B4]" />

      {/* Content */}
      <div className="relative space-y-2 pt-4 md:pt-6 h-full flex flex-col justify-between items-center w-full">
        {/* Logo and Brand */}
        <div className="space-y-6 md:space-y-8 w-full">
          <div className="flex items-start justify-start gap-3">
            <Image
              src="/logos/notelab-main.png"
              alt="Notesay AI"
              width={32}
              height={32}
            />
            <h1 className="text-xl md:text-2xl font-bold text-stone-800" style={{ fontFamily: 'Videotype, sans-serif' }}>
              Notesay AI
            </h1>
          </div>

          {/* Alert message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-8">
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-red-900 mb-2" style={{ fontFamily: 'Videotype, sans-serif' }}>
                {isPastDue ? "Payment Failed" : "Subscription Expired"}
              </h2>
              <p className="text-xs md:text-sm text-red-800 leading-relaxed" style={{ fontFamily: 'Videotype, sans-serif' }}>
                {isPastDue
                  ? "Your payment method was declined. Please update your payment information to regain access to Notesay AI."
                  : "Your subscription has ended. Renew your subscription to continue learning English with all premium features."}
              </p>
            </div>

            {/* Price Section - Integrated */}
            <div className="text-center pt-4 md:pt-6 border-t border-red-100">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-stone-900" style={{ fontFamily: 'Videotype, sans-serif' }}>$20</span>
                <span className="text-base md:text-lg text-stone-600" style={{ fontFamily: 'Videotype, sans-serif' }}>/month</span>
              </div>
              <p className="text-xs md:text-sm text-stone-700 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>
                {isPastDue ? "Update payment to restore access" : "Renew to restore full access"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3 pb-10 md:pb-20 w-full">
          {isPastDue ? (
            <button
              onClick={handleUpdatePayment}
              disabled={loading}
              className="w-full h-14 bg-white/80 backdrop-blur-sm hover:bg-white text-stone-800 font-bold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Update Payment Method</span>
                </div>
              )}
            </button>
          ) : (
            <div className="space-y-1.5">
            <button
              onClick={handleRenew}
              disabled={loading}
              className="w-full h-14 bg-white/80 backdrop-blur-sm hover:bg-white text-stone-800 font-bold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6" />
                  <span>Renew Subscription</span>
                </div>
              )}
            </button>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full h-10 text-stone-600 hover:text-stone-900 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
