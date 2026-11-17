"use client";

import { Loader2, CreditCard, LogOut } from "lucide-react";
import { useCheckout } from "../hooks/useCheckout";
import { signOut } from "@/features/auth/presentation/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FirstSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FirstSubscriptionDialog({ open }: FirstSubscriptionDialogProps) {
  const router = useRouter();
  const checkoutMutation = useCheckout();
  const loading = checkoutMutation.isPending;

  const handleSubscribe = async () => {
    checkoutMutation.mutate("MONTHLY");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!open) return null;

  return (
    <div className="w-[95%] h-[95%] md:w-[45%] md:h-[85%] relative p-4 md:p-6 flex flex-col justify-between items-center overflow-hidden rounded-3xl shadow-2xl">
      {/* Gradient background - Brand colors (yellow to lavender) */}
      <div className="absolute inset-0 bg-linear-to-b from-[#dfecc8] via-[#dfecc830] to-[#C4B4FF]" />

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

          {/* Welcome message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-8">
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'Videotype, sans-serif' }}>
                Welcome! Start Your Learning Journey
              </h2>
              <p className="text-xs md:text-sm text-stone-700 leading-relaxed" style={{ fontFamily: 'Videotype, sans-serif' }}>
                Get unlimited access to all features and start improving your English with AI-powered conversations, personalized practice, and more.
              </p>
            </div>

            {/* Price Section */}
            <div className="text-center pt-4 md:pt-6 border-t border-stone-200">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-stone-900" style={{ fontFamily: 'Videotype, sans-serif' }}>$20</span>
                <span className="text-base md:text-lg text-stone-600" style={{ fontFamily: 'Videotype, sans-serif' }}>/month</span>
              </div>
              <p className="text-xs md:text-sm text-stone-700 font-bold" style={{ fontFamily: 'Videotype, sans-serif' }}>
                Full access to all premium features
              </p>
              <p className="text-xs md:text-sm text-emerald-600 font-semibold mt-2" style={{ fontFamily: 'Videotype, sans-serif' }}>
                7-day free trial included
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 pb-10 md:pb-20 w-full">
          <button
            onClick={handleSubscribe}
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
                <span>Start Subscription</span>
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
      </div>
    </div>
  );
}
