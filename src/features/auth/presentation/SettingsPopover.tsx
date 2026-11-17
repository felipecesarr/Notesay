"use client";

import React, { useState } from "react";
import { User, CreditCard, LogOut, Edit2, Check, X, Loader2, ExternalLink, AlertCircle, HelpCircle } from "lucide-react";
import { signOut } from "./auth-client";
import { useAuth } from "@/core/providers/auth-provider";
import { Input } from "@/core/components/ui/input";
import { createPortalSession } from "@/features/subscription/controller"; // Removed unused functions
import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import { useOnboardingStore } from "@/features/onboarding/store/onboarding-store";

interface SettingsPopoverProps {
  onClose?: () => void;
}

export function SettingsPopover({ onClose }: SettingsPopoverProps) {
  const { session } = useAuth();
  const { subscription, status } = useSubscription();
  const { resetTour, startTour } = useOnboardingStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedName, setEditedName] = useState((session?.user as { name?: string })?.name || "");
  const [editedEmail, setEditedEmail] = useState((session?.user as { email?: string })?.email || "");

  // Subscription state
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Check if subscription is in trial
  const isTrialing = subscription?.status === "trialing";

  const handleRestartTour = () => {
    onClose?.(); // Close the settings sheet first (especially on mobile)
    resetTour();
    startTour();
  };

  // Removed useEffect loadStatus

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleSaveName = async () => {
    // TODO: API call to update name
    setIsEditingName(false);
  };

  const handleSaveEmail = async () => {
    // TODO: API call to update email
    setIsEditingEmail(false);
  };

  const handleManageBilling = async () => {
    setLoadingAction("portal");
    const result = await createPortalSession();
    if (result.success && result.url) {
      window.open(result.url, "_blank");
    } else {
      alert("Failed to open billing portal");
    }
    setLoadingAction(null);
  };


  const formatDate = (date: string | Date | number) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-stone-100 shrink-0">
        <h2 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Settings</h2>
      </div>

      {/* Content */}
      <div className="px-3 py-3 space-y-3 overflow-y-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#dfecc870] flex items-center justify-center">
              <User className="w-5 h-5 text-[#1b5f4a]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Profile</h3>
            </div>
          </div>
          
          {/* Name Field */}
          <div className="mb-2">
            <label className="text-[9px] text-stone-400 mb-1 block">Name</label>
            {isEditingName ? (
              <div className="flex gap-1">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-7 text-xs bg-stone-50"
                />
                <button onClick={handleSaveName} className="p-1.5 bg-[#dfecc870] text-[#1b5f4a] rounded hover:bg-[#dfecc8]">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setIsEditingName(false)} className="p-1.5 bg-stone-50 text-stone-600 rounded hover:bg-stone-100">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-stone-50 rounded-lg px-2 py-1.5">
                <span className="text-xs text-stone-900">{(session?.user as { name?: string })?.name || "User"}</span>
                <button onClick={() => setIsEditingName(true)} className="text-stone-400 hover:text-stone-600">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="text-[9px] text-stone-400 mb-1 block">Email</label>
            {isEditingEmail ? (
              <div className="flex gap-1">
                <Input
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="h-7 text-xs bg-stone-50"
                />
                <button onClick={handleSaveEmail} className="p-1.5 bg-[#dfecc870] text-[#1b5f4a] rounded hover:bg-[#dfecc8]">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setIsEditingEmail(false)} className="p-1.5 bg-stone-50 text-stone-600 rounded hover:bg-stone-100">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-stone-50 rounded-lg px-2 py-1.5">
                <span className="text-xs text-stone-900 truncate">{(session?.user as { email?: string })?.email || ""}</span>
                <button onClick={() => setIsEditingEmail(true)} className="text-stone-400 hover:text-stone-600">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          <div className="pt-2 mt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="text-[9px] text-stone-500">Signed in with Google</span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className={`rounded-xl p-3 ${
          isTrialing
            ? "bg-blue-50"
            : status?.isCanceled
              ? "bg-amber-50"
              : "bg-[#dfecc870]"
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isTrialing
                  ? "bg-blue-100"
                  : status?.isCanceled
                    ? "bg-amber-100"
                    : "bg-[#dfecc8]"
              }`}>
                <CreditCard className={`w-3.5 h-3.5 ${
                  isTrialing
                    ? "text-blue-600"
                    : status?.isCanceled
                      ? "text-amber-600"
                      : "text-[#1b5f4a]"
                }`} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-stone-900">Notesay AI</h3>
                <p className="text-[9px] text-stone-600">$20/month</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-medium rounded-full ${
              isTrialing
                ? "bg-blue-100 text-blue-700"
                : status?.isCanceled
                  ? "bg-amber-500 text-white"
                  : "bg-[#dfecc8] text-[#1b5f4a]"
            }`}>
              {isTrialing
                ? "Free Trial"
                : status?.isCanceled
                  ? "Canceling"
                  : "Active"}
            </span>
          </div>
          
          {subscription && (
            <div className="mb-2">
              <p className="text-[9px] text-stone-600">
                {isTrialing
                  ? `Trial ends ${formatDate(subscription.currentPeriodEnd as string | number | Date)}`
                  : status?.isCanceled
                    ? `Ends ${formatDate(subscription.currentPeriodEnd as string | number | Date)}`
                    : `Renews ${formatDate(subscription.currentPeriodEnd as string | number | Date)}`
                }
              </p>
            </div>
          )}

          {status?.isCanceled && (
            <div className="flex items-start gap-1.5 mb-2 p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[9px] text-amber-900 leading-relaxed">
                Your subscription will end on {formatDate(subscription?.currentPeriodEnd as string | number | Date)}. You can resume anytime.
              </p>
            </div>
          )}

          {isTrialing && (
            <div className="flex items-start gap-1.5 mb-2 p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[9px] text-blue-900 leading-relaxed">
                Your free trial ends on {formatDate(subscription?.currentPeriodEnd as string | number | Date)}.
                You will be charged $20/month after the trial.
              </p>
            </div>
          )}

          <button
            onClick={handleManageBilling}
            disabled={loadingAction === "portal"}
            className="w-full px-3 py-1.5 text-[10px] font-medium bg-white text-[#1b5f4a] rounded-lg hover:bg-[#dfecc8] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loadingAction === "portal" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ExternalLink className="w-3 h-3" />
            )}
            Manage Billing
          </button>
        </div>

        {/* Restart Tutorial Button */}
        <button
          onClick={handleRestartTour}
          className="w-full px-2 py-1.5 text-[10px] font-medium text-stone-600 hover:text-[#1b5f4a] rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-stone-200"
        >
          <HelpCircle className="w-3 h-3" />
          Restart Tutorial
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="border border-stone-200 w-full px-2 py-1.5 text-[10px] font-medium text-stone-600 hover:text-rose-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3 h-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
