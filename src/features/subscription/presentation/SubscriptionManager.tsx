"use client";

import React, { useState } from "react";
import { Loader2, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { 
  createPortalSession, 
  cancelSubscription,
  resumeSubscription 
} from "../controller";
import { useSubscription } from "../hooks/useSubscription";

export function SubscriptionManager() {
  const { subscription, status, isLoading, refetchSubscription } = useSubscription();
  // const [loading, setLoading] = useState(true); // Removed
  const [actionLoading, setActionLoading] = useState(false);
  // const [subscription, setSubscription] = useState<any>(null); // Removed
  // const [status, setStatus] = useState<any>(null); // Removed

  // Removed useEffect and loadSubscription

  const handleManageBilling = async () => {
    setActionLoading(true);
    const result = await createPortalSession();
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error || "Failed to open billing portal");
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.")) {
      return;
    }

    setActionLoading(true);
    const result = await cancelSubscription();
    if (result.success) {
      await refetchSubscription();
    } else {
      alert(result.error || "Failed to cancel subscription");
    }
    setActionLoading(false);
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    const result = await resumeSubscription();
    if (result.success) {
      await refetchSubscription();
    } else {
      alert(result.error || "Failed to resume subscription");
    }
    setActionLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!subscription || !status) {
    return (
      <div className="bg-stone-50 rounded-lg p-8 text-center">
        <p className="text-stone-600 mb-4">You don&apos;t have an active subscription</p>
        <a
          href="/pricing"
          className="inline-block bg-violet-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
        >
          View Plans
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Status Banner */}
      {status.isPastDue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Payment Failed</h3>
            <p className="text-sm text-red-700 mt-1">
              Your last payment failed. Please update your payment method to continue your subscription.
            </p>
          </div>
        </div>
      )}

      {status.isCanceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Subscription Canceled</h3>
            <p className="text-sm text-amber-700 mt-1">
              Your subscription will end on {new Date(subscription.currentPeriodEnd as string | number | Date).toLocaleDateString()}.
              You can resume it anytime before then.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Details */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-6">Your Subscription</h2>

        <div className="space-y-4">
          {/* Plan */}
          <div className="flex items-center justify-between py-3 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Plan</p>
                <p className="font-semibold text-stone-900 capitalize">{subscription.plan as React.ReactNode}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status.isActive
                ? "bg-green-100 text-green-700"
                : "bg-stone-100 text-stone-700"
            }`}>
              {subscription.status as React.ReactNode}
            </span>
          </div>

          {/* Billing Period */}
          <div className="flex items-center gap-3 py-3 border-b border-stone-100">
            <Calendar className="w-5 h-5 text-stone-400" />
            <div>
              <p className="text-sm text-stone-500">Current Period</p>
              <p className="font-semibold text-stone-900">
                {new Date(subscription.currentPeriodStart as string | number | Date).toLocaleDateString()} -{" "}
                {new Date(subscription.currentPeriodEnd as string | number | Date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleManageBilling}
            disabled={actionLoading}
            className="w-full bg-violet-500 text-white py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Manage Billing"
            )}
          </button>

          {status.isCanceled ? (
            <button
              onClick={handleResumeSubscription}
              disabled={actionLoading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resume Subscription
            </button>
          ) : (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="w-full bg-white text-red-600 border border-red-200 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-stone-500 text-center mt-6">
        Need help? Contact our support team at {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com"}
      </p>
    </div>
  );
}
