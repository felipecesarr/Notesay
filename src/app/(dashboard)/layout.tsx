"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/providers/auth-provider";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import { OnboardingProvider } from "@/features/onboarding/presentation/OnboardingProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (authLoading) return;
      
      // Must be logged in
      if (!session) {
        router.push("/");
        return;
      }

      // Check subscription
      const hasSubscription = await hasActiveSubscription();
      
      // MUST have subscription to access dashboard
      if (!hasSubscription) {
        void 0;
        router.push("/subscribe");
        return;
      }
      
      void 0;
      setCheckingSubscription(false);
    }

    checkAccess();
  }, [authLoading, session, router]);

  // Show loading while checking
  if (authLoading || checkingSubscription) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white/60 backdrop-blur-md">
        <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow access
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
}
