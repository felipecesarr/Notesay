"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Volume2, Shuffle, Trash2 } from "lucide-react";

// Demo flashcards data
const DEMO_FLASHCARDS = [
  {
    front: "give you up",
    back: "To stop having a relationship with someone; to abandon or desert someone.",
    context: "I'm never gonna give you up, never gonna let you down.",
  },
  {
    front: "let you down",
    back: "To disappoint someone; to fail to meet someone's expectations.",
    context: "He promised he would never let her down.",
  },
  {
    front: "run around",
    back: "To move quickly in many directions; to be very busy going to different places.",
    context: "Stop running around and focus on your studies.",
  },
];

export function FlashcardsDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    "show" | "flip" | "next" | "flip2" | "next2" | "reset"
  >("show");

  // Animation loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (animationPhase === "show") {
      // Show first card
      timeout = setTimeout(() => {
        setAnimationPhase("flip");
      }, 2000);
    } else if (animationPhase === "flip") {
      // Flip to show back
      setTimeout(() => setIsFlipped(true), 0);
      timeout = setTimeout(() => {
        setAnimationPhase("next");
      }, 3000);
    } else if (animationPhase === "next") {
      // Go to next card
      setTimeout(() => setIsFlipped(false), 0);
      timeout = setTimeout(() => {
        setCurrentIndex(1);
        setAnimationPhase("flip2");
      }, 500);
    } else if (animationPhase === "flip2") {
      // Flip second card
      timeout = setTimeout(() => {
        setIsFlipped(true);
      }, 1500);
      timeout = setTimeout(() => {
        setAnimationPhase("next2");
      }, 4000);
    } else if (animationPhase === "next2") {
      // Go to third card
      setTimeout(() => setIsFlipped(false), 0);
      timeout = setTimeout(() => {
        setCurrentIndex(2);
      }, 500);
      timeout = setTimeout(() => {
        setAnimationPhase("reset");
      }, 3000);
    } else if (animationPhase === "reset") {
      // Reset to beginning
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex(0);
      }, 0);
      timeout = setTimeout(() => {
        setAnimationPhase("show");
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [animationPhase]);

  const currentCard = DEMO_FLASHCARDS[currentIndex];

  return (
    <div className="flex flex-col h-full bg-stone-50/30 relative overflow-hidden">
      {/* Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
        <div 
          className="w-full max-w-[380px] aspect-[1.5/1] relative cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <div
            className="w-full h-full relative transition-transform duration-500 ease-out"
            style={{ 
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            {/* FRONT */}
            <div 
              className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* Volume button */}
              <div className="absolute top-4 right-4">
                <button className="p-2 rounded-full text-stone-300">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
                <h2 className="text-2xl font-semibold text-stone-800 leading-tight">
                  {currentCard.front}
                </h2>
              </div>

              {/* Tap hint */}
              <p className="text-xs text-stone-400 absolute bottom-4">
                Tap to reveal
              </p>
            </div>

            {/* BACK */}
            <div 
              className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center p-8 text-center"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)" 
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full">
                <p className="text-sm text-stone-700 leading-relaxed font-medium">
                  {currentCard.back}
                </p>
                <div className="mt-2 pt-3 border-t border-stone-100 w-full">
                  <p className="text-xs text-stone-500 italic leading-relaxed">
                    &quot;{currentCard.context}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar (Bottom) */}
      <div className="p-6 flex justify-center shrink-0">
        <div className="bg-stone-100 rounded-lg p-1.5 flex items-center gap-2">
          {/* Shuffle */}
          <button className="h-8 w-8 rounded-lg text-stone-500 flex items-center justify-center">
            <Shuffle className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-stone-300 mx-1" />

          {/* Navigation */}
          <div className="flex items-center gap-2 px-2">
            <button className={`h-6 w-6 rounded-lg flex items-center justify-center ${currentIndex === 0 ? "text-stone-300" : "text-stone-500"}`}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-xs font-medium text-stone-500 tabular-nums min-w-12 text-center">
              {currentIndex + 1} of {DEMO_FLASHCARDS.length}
            </span>

            <button className={`h-6 w-6 rounded-lg flex items-center justify-center ${currentIndex === DEMO_FLASHCARDS.length - 1 ? "text-stone-300" : "text-stone-500"}`}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-4 bg-stone-300 mx-1" />

          {/* Delete */}
          <button className="h-8 w-8 rounded-lg text-stone-400 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo label */}
      <p className="text-xs text-stone-400 text-center pb-4">
        ↑ Review your saved vocabulary with spaced repetition
      </p>
    </div>
  );
}
