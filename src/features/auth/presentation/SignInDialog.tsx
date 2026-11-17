"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/core/components/ui/button";
import { signIn } from "@/features/auth/presentation/auth-client";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/dialog";
import Image from "next/image";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Sign in failed:");
      setIsLoading(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[400px]! w-[400px]! rounded-3xl md:rounded-4xl p-6 md:p-10 bg-white/20 shadow-lg bg-linear-to-b from-[#dfecc8]/80 via-white to-white"
      >
        <DialogTitle className="sr-only">Sign In to Notesay AI</DialogTitle>

        {/* Logo & Headline */}
        <div className="flex flex-col items-center gap-4 md:gap-6 mb-8 md:mb-10 w-full text-center">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <div className="absolute inset-0 bg-transparent rounded-full animate-pulse" />
            <div className="relative bg-transparent rounded-2xl w-full h-full flex items-center justify-center">
              <Image
                src="/logos/notelab-main.png"
                alt="NoteSay AI Logo"
                width={40}
                height={40}
                className="object-contain w-8 h-8 md:w-10 md:h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl text-stone-900 leading-none" style={{ fontFamily: 'Videotype, sans-serif' }}>
              Notesay AI
            </h1>
            <p className="text-xs md:text-sm text-stone-500 font-medium">
              Your intelligent fluency engine.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="group w-full h-12 md:h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-xl md:rounded-2xl relative overflow-hidden transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(28,25,23,0.2)] hover:shadow-[0_12px_24px_-8px_rgba(28,25,23,0.3)] hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex items-center justify-between w-full px-1">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-white rounded-lg p-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <span className="font-bold tracking-wide text-xs md:text-sm">Continue with Google</span>
              </div>

              <div className="hidden md:flex items-center text-white/40 group-hover:text-white transition-colors">
                <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity mr-2">ENTER</span>
                →
              </div>
            </div>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
