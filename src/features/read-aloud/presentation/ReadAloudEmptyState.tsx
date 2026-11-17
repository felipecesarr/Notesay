"use client";

import React from "react";
import { BookOpen, Sparkles, Wand2, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

export function ReadAloudEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center h-full px-8 py-12"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-6"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#dfecc8] to-[#dfecc870] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#1b5f4a]" />
          </div>
          {/* Floating sparkle */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-5 h-5 text-[#1b5f4a] fill-[#1b5f4a]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg font-semibold text-stone-800 mb-2"
      >
        No practice texts yet
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-sm text-stone-500 text-center max-w-md mb-8"
      >
        Generate personalized texts to practice pronunciation and fluency
      </motion.p>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-md space-y-3"
      >
        <div className="flex items-start gap-3 p-3 rounded-lg bg-stone-50/50 hover:bg-stone-50 transition-colors">
          <div className="shrink-0 w-8 h-8 rounded-full bg-[#deefc870] flex items-center justify-center mt-0.5">
            <Wand2 className="w-4 h-4 text-[#1b5f4a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-700 mb-0.5">
              AI-generated texts
            </p>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Click New to generate texts. Pick two topics, choose text size (small, medium, large), and select words from your flashcards to include. AI creates personalized content using your vocabulary for better practice
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-stone-50/50 hover:bg-stone-50 transition-colors">
          <div className="shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center mt-0.5">
            <Volume2 className="w-4 h-4 text-[#1b5f4a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-700 mb-0.5">
              Three practice modes
            </p>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Read aloud to practice pronunciation, use shadowing to mimic native speech, or listen mode to train comprehension. Track progress for each mode
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
