"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Sparkles, PenLine } from "lucide-react";
import { generateWordAnalysis } from "@/meetmate/services/ai/gemini";

interface CreateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFlashcard: (
    front: string,
    back: string,
    context?: string,
    tense?: string,
    phonetic?: string
  ) => Promise<void>;
}

type Mode = "manual" | "ai";

interface AIAnalysis {
  word: string;
  meaning: string;
  usage: string;
  tense: string;
  phonetic: string;
}

export function CreateFlashcardModal({
  isOpen,
  onClose,
  onCreateFlashcard,
}: CreateFlashcardModalProps) {
  const [mode, setMode] = useState<Mode>("ai");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual mode fields
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [context, setContext] = useState("");

  // AI mode fields
  const [aiInput, setAiInput] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const resetForm = () => {
    setFront("");
    setBack("");
    setContext("");
    setAiInput("");
    setAiAnalysis(null);
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading && !isAnalyzing) {
      resetForm();
      onClose();
    }
  };

  const handleAnalyze = async () => {
    if (!aiInput.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await generateWordAnalysis(aiInput.trim());
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Failed to analyze:");
      setError("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveManual = async () => {
    if (!front.trim() || !back.trim()) {
      setError("Please fill in both the word and its meaning");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreateFlashcard(front.trim(), back.trim(), context.trim() || undefined);
      resetForm();
      onClose();
    } catch {
      setError("Failed to create flashcard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAI = async () => {
    if (!aiAnalysis) return;

    setIsLoading(true);
    setError(null);

    try {
      await onCreateFlashcard(
        aiAnalysis.word,
        aiAnalysis.meaning,
        aiAnalysis.usage,
        aiAnalysis.tense,
        aiAnalysis.phonetic
      );
      resetForm();
      onClose();
    } catch {
      setError("Failed to create flashcard");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900">Create Flashcard</h3>
          <button
            onClick={handleClose}
            disabled={isLoading || isAnalyzing}
            className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-4 pt-4">
          <div className="flex bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => {
                setMode("ai");
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "ai"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </button>
            <button
              onClick={() => {
                setMode("manual");
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "manual"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <PenLine className="w-3 h-3" />
              Manual
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-4">
          {mode === "ai" ? (
            <>
              {/* AI Mode */}
              {!aiAnalysis ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="ai-input" className="block text-xs font-medium text-stone-600 mb-1.5">
                      Word or Phrase
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="ai-input"
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && aiInput.trim() && !isAnalyzing) {
                            handleAnalyze();
                          }
                        }}
                        placeholder="Type a word or phrase to analyze..."
                        disabled={isAnalyzing}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1b5f4a]/20 focus:border-[#1b5f4a] transition-colors disabled:opacity-50"
                        autoFocus
                      />
                      <button
                        onClick={handleAnalyze}
                        disabled={!aiInput.trim() || isAnalyzing}
                        className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Analyze
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 text-center">
                    AI will analyze the word and generate meaning, usage example, and phonetics
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* AI Analysis Preview */}
                  <div className="bg-[#dfecc830] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-stone-900">{aiAnalysis.word}</h4>
                        {aiAnalysis.phonetic && (
                          <p className="text-xs text-stone-500">{aiAnalysis.phonetic}</p>
                        )}
                      </div>
                      {aiAnalysis.tense && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-medium">
                          {aiAnalysis.tense}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-stone-600 mb-1">Meaning</p>
                      <p className="text-sm text-stone-800">{aiAnalysis.meaning}</p>
                    </div>
                    {aiAnalysis.usage && (
                      <div>
                        <p className="text-xs font-medium text-stone-600 mb-1">Example</p>
                        <p className="text-sm text-stone-600 italic">&quot;{aiAnalysis.usage}&quot;</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAiAnalysis(null);
                      setAiInput("");
                    }}
                    className="text-xs text-stone-500 hover:text-stone-700 underline"
                  >
                    Try a different word
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Manual Mode */}
              <div>
                <label htmlFor="front" className="block text-xs font-medium text-stone-600 mb-1.5">
                  Word / Phrase
                </label>
                <input
                  id="front"
                  type="text"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="e.g., Serendipity"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1b5f4a]/20 focus:border-[#1b5f4a] transition-colors disabled:opacity-50"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="back" className="block text-xs font-medium text-stone-600 mb-1.5">
                  Meaning / Definition
                </label>
                <textarea
                  id="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="The occurrence of events by chance in a happy way"
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1b5f4a]/20 focus:border-[#1b5f4a] transition-colors resize-none disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="context" className="block text-xs font-medium text-stone-600 mb-1.5">
                  Example Sentence <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  id="context"
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Finding this café was pure serendipity."
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1b5f4a]/20 focus:border-[#1b5f4a] transition-colors disabled:opacity-50"
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isAnalyzing}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={mode === "ai" ? handleSaveAI : handleSaveManual}
              disabled={
                isLoading ||
                isAnalyzing ||
                (mode === "ai" ? !aiAnalysis : !front.trim() || !back.trim())
              }
              className="px-4 py-2 text-xs font-medium text-white bg-[#1b5f4a] hover:bg-[#164a3a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Flashcard"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
