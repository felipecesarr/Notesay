"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  X,
} from "lucide-react";

interface QuizFeedbackProps {
  feedback: {
    overallPerformance: string;
    strengths: string[];
    areasToImprove: string[];
    nextSteps: string;
    encouragement: string;
  };
  onClose: () => void;
}

export function QuizFeedback({ feedback, onClose }: QuizFeedbackProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-violet-500 to-purple-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Quiz Feedback</h2>
              <p className="text-violet-100 text-sm">
                Great work! Here&apos;s how you did
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Overall Performance */}
          <div className="bg-stone-50 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Overall Performance
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              {feedback.overallPerformance}
            </p>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <p className="text-sm text-green-900">{strength}</p>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Areas to Improve */}
          {feedback.areasToImprove.length > 0 && (
            <div>
              <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {feedback.areasToImprove.map((area, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
                  >
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">→</span>
                    </div>
                    <p className="text-sm text-amber-900">{area}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
            <h3 className="font-semibold text-violet-900 mb-2">Next Steps</h3>
            <p className="text-sm text-violet-800 leading-relaxed">
              {feedback.nextSteps}
            </p>
          </div>

          {/* Encouragement */}
          <div className="bg-linear-to-r from-violet-100 to-purple-100 rounded-2xl p-5 text-center">
            <p className="text-sm text-violet-900 font-medium italic">
              &quot;{feedback.encouragement}&quot;
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
          >
            Continue Learning
          </button>
        </div>
      </motion.div>
    </div>
  );
}
