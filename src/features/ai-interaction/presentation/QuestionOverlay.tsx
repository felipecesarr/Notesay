"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

type QuestionOverlayProps = {
  question: string;
  isProcessing?: boolean;
};

/**
 * PRESENTATION LAYER
 * Displays AI-generated question as an overlay
 */
export const QuestionOverlay = React.memo(
  ({ question, isProcessing = false }: QuestionOverlayProps) => {
    return (
      <div className="absolute inset-x-0 bottom-8 flex justify-center px-4 pointer-events-none z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={question}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-linear-to-r from-purple-500/95 to-violet-600/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Question Text */}
                <div className="flex-1 min-w-0">
                  {isProcessing ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-white/20 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-white/20 rounded animate-pulse w-1/2" />
                    </div>
                  ) : (
                    <p className="text-white text-lg leading-relaxed font-medium">
                      {question}
                    </p>
                  )}
                </div>
              </div>

              {/* Visual accent */}
              <div className="absolute -top-1 -right-1 w-20 h-20 bg-linear-to-br from-white/10 to-transparent rounded-full blur-2xl" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
);

QuestionOverlay.displayName = "QuestionOverlay";
