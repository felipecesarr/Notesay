"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Search, X } from "lucide-react";

// Demo video data for animation
const DEMO_VIDEO = {
  url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  id: "dQw4w9WgXcQ",
  thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  title: "Never Gonna Give You Up",
  author: "Rick Astley",
};

export const YouTubeInputDemo = React.memo(function YouTubeInputDemo() {
  const [animationPhase, setAnimationPhase] = useState<"typing" | "detected" | "reset">("typing");
  const [typedText, setTypedText] = useState("");
  const [showChip, setShowChip] = useState(false);

  // Animation loop: type URL -> show chip -> reset
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (animationPhase === "typing") {
      // Type the URL character by character
      const urlToType = DEMO_VIDEO.url;
      if (typedText.length < urlToType.length) {
        timeout = setTimeout(() => {
          setTypedText(urlToType.slice(0, typedText.length + 1));
        }, 50);
      } else {
        // URL fully typed, wait then show chip
        timeout = setTimeout(() => {
          setShowChip(true);
          setAnimationPhase("detected");
        }, 500);
      }
    } else if (animationPhase === "detected") {
      // Show chip for 3 seconds then reset
      timeout = setTimeout(() => {
        setShowChip(false);
        setTypedText("");
        setAnimationPhase("reset");
      }, 4000);
    } else if (animationPhase === "reset") {
      // Wait before starting over
      timeout = setTimeout(() => {
        setAnimationPhase("typing");
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [animationPhase, typedText]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-12">
      {/* Floating Logo with bounce animation */}
      <div className="mb-12 animate-bounce" style={{ animationDuration: "3s" }}>
        <Image
          src="/logos/notelab-input.png"
          alt="Notesay Logo"
          width={54}
          height={54}
          className="-rotate-12"
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Gradient glow background */}
        <div className="absolute inset-0 bg-linear-to-t from-[#C4B4FF] to-[#D0E4AC] blur-md opacity-90 rounded-3xl" />
        
        {/* Main Input Card */}
        <div className="relative w-full bg-white border border-stone-100 rounded-3xl p-4">
          <div className="flex flex-col min-h-[100px]">
            {/* Content Area */}
            <div className="flex-1 mb-4 flex flex-col gap-3">
              {/* Detected Video Chip - shown after URL is typed */}
              {showChip ? (
                <div className="flex items-center gap-3 bg-stone-100 rounded-xl p-0 w-fit max-w-[280px] h-auto animate-in fade-in slide-in-from-bottom-2 relative group pr-10">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-12 shrink-0 rounded-lg my-2 ml-2 overflow-hidden bg-stone-200">
                    <Image
                      src={DEMO_VIDEO.thumbnail}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col min-w-[120px]">
                    <span className="text-xs font-semibold text-stone-800 truncate max-w-40 leading-tight mb-0.5">
                      {DEMO_VIDEO.title}
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight">
                      {DEMO_VIDEO.author}
                    </span>
                  </div>

                  {/* Close button (decorative) */}
                  <div className="p-1 absolute right-2 top-2 text-stone-400 bg-stone-200 rounded-full">
                    <X className="w-2.5 h-2.5" />
                  </div>
                </div>
              ) : (
                /* Input Field with typing animation */
                <div className="flex items-center">
                  <span className="text-sm text-stone-600 m-2">
                    {typedText || "Paste YouTube URL..."}
                    {!showChip && typedText && (
                      <span className="animate-pulse">|</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center gap-2">
                {/* Suggestions button */}
                <div className="flex items-center gap-2 p-3 rounded-full text-stone-500 text-xs font-medium bg-stone-100">
                  <Search className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Submit button */}
                <div
                  className={`
                    flex items-center justify-center gap-2 px-3 py-3 rounded-full text-sm font-medium transition-all
                    ${showChip
                      ? "bg-[#1b5f4a] text-[#dfecc8]"
                      : "bg-[#dfecc870] text-[#1b5f4a"
                    }
                  `}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo label */}
      <p className="text-xs text-stone-400 mt-6">
        ↑ Just paste any YouTube link to start learning
      </p>
    </div>
  );
});
