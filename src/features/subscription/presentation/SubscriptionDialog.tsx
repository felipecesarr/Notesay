"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, LogOut } from "lucide-react";
import { createCheckoutSession } from "../controller"; // Removed getSubscriptionStatus
import { useSubscription } from "../hooks/useSubscription";
import { signOut } from "@/features/auth/presentation/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionDialog({ open }: SubscriptionDialogProps) {
  const { status, isLoading: isChecking } = useSubscription();
  const [loading, setLoading] = useState(false);
  // const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null); // Removed
  // const [isChecking, setIsChecking] = useState(true); // Removed
  const router = useRouter();

  // Removed useEffect checkStatus

  const handleSubscribe = async () => {
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Determine if this is a renewal vs new subscription
  // Determine if this is a renewal vs new subscription
  // Logic: If status exists and is canceled OR past due
  const isExpired = status?.isCanceled || status?.isPastDue;

  if (!open) return null;

  return (
    <div className="w-[45%] h-[85%] relative p-6 flex flex-col justify-between items-center overflow-hidden rounded-3xl shadow-2xl">
      {/* Gradient background - Same as SignInDialog right panel */}
      <div className="absolute inset-0 bg-linear-to-b from-[#dfecc8] via-[#dfecc830] to-[#C4B4FF]" />
      
      {/* Content */}
      <div className="relative space-y-2 pt-6 h-full flex flex-col justify-between items-center w-full">
        {/* Logo and Brand */}
        <div className="space-y-8 w-full">
          <div className="flex items-start justify-start gap-3">
            <Image 
              src="/logos/notelab-main.png" 
              alt="Notesay AI" 
              width={32}
              height={32}
            />
            <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Videotype, sans-serif' }}>
              Notesay AI
            </h1>
          </div>

          {/* Price Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-stone-900" style={{ fontFamily: 'Videotype, sans-serif' }}>$20</span>
                <span className="text-xl text-stone-600" style={{ fontFamily: 'Videotype, sans-serif' }}>/month</span>
              </div>
              <p className="text-xs text-stone-600 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>
                {isExpired ? "Renew to continue" : "Cancel anytime"}
              </p>
              {!isExpired && (
                <p className="text-xs text-emerald-600 font-semibold mt-2" style={{ fontFamily: 'Videotype, sans-serif' }}>
                  7-day free trial included
                </p>
              )}
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-4 justify-center items-center w-[90%] pt-2">
            <div className="flex items-start gap-3">
              <span className="text-stone-800 text-sm mt-0.5 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>*</span>
              <p className="text-xs text-stone-800 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>Unlimited AI conversations with 6 modes</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-stone-800 text-sm mt-0.5 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>*</span>
              <p className="text-xs text-stone-800 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>Smart vocabulary revival and flashcards</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-stone-800 text-sm mt-0.5 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>*</span>
              <p className="text-xs text-stone-800 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>YouTube practice and shadowing mode</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-stone-800 text-sm mt-0.5 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>*</span>
              <p className="text-xs text-stone-800 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>Interview preparation and listening practice</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pb-20 w-full flex-col items-center justify-center align-middle">
          <button
            onClick={handleSubscribe}
            disabled={loading || isChecking}
            className="w-full h-12 bg-white/80 backdrop-blur-sm hover:bg-white text-stone-800 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading || isChecking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isChecking ? "Loading..." : "Processing..."}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                <span>{isExpired ? "Renew Subscription" : "Start Subscription"}</span>
              </div>
            )}
          </button>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full h-10 text-stone-600 hover:text-red-600 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>

          <p className="text-xs text-center text-stone-700">
            Secure payment by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
