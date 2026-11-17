"use client";

import { FirstSubscriptionDialog } from "@/features/subscription/presentation/FirstSubscriptionDialog";
import { ExpiredSubscriptionDialog } from "@/features/subscription/presentation/ExpiredSubscriptionDialog";
import { getSubscriptionStatus } from "@/features/subscription/controller";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

type SubscriptionState = "new-user" | "expired" | null;

const InterviewSession = dynamic(
  () => import("@/features/interview/presentation/InterviewSession"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-stone-50">
        <div className="animate-pulse text-stone-400">Loading...</div>
      </div>
    ),
  }
);

export default function SubscribePage() {
  const router = useRouter();
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(null);
  const [isPastDue, setIsPastDue] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      const status = await getSubscriptionStatus();

      if (status.success) {
        if (status.isActive) {
          router.replace("/dashboard");
          return;
        }

        if (!status.subscription) {
          setSubscriptionState("new-user");
        } else {
          setSubscriptionState("expired");
          setIsPastDue(status.isPastDue || false);
        }
      }
    }
    checkStatus();
  }, [router]);

  if (subscriptionState === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white/60 backdrop-blur-md">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* App running in background */}
      <main className="h-screen w-screen bg-stone-50 flex flex-col overflow-hidden">
        <div className="flex-1 w-full h-full overflow-hidden p-4">
          <InterviewSession />
        </div>
      </main>

      {/* Dark overlay with correct dialog */}
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        {subscriptionState === "new-user" ? (
          <FirstSubscriptionDialog open={true} onClose={() => {}} />
        ) : (
          <ExpiredSubscriptionDialog open={true} isPastDue={isPastDue} />
        )}
      </div>
    </>
  );
}
