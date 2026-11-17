"use client";

import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { normalizeText, calculateAccuracy } from "../procedure";

interface ListeningModeProps {
  chunks: string[];
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  isPlaying: boolean;
  loadingChunkIndex: number | null;
  handleSpeak: (text: string, chunkIndex: number) => void;
  textId: string;
  initialProgress?: { completedChunks: number; totalChunks: number; completedIndices: number[] };
  onProgressChange?: (mode: string, completedChunks: number, totalChunks: number, completedIndices: number[]) => void;
  activeChunkRef?: React.RefObject<HTMLDivElement | null>;
  autoScroll?: boolean;
}

export const ListeningMode = memo(function ListeningMode({ chunks, loadingChunkIndex, handleSpeak, initialProgress, onProgressChange, activeChunkRef, autoScroll }: ListeningModeProps) {
  const [inputs, setInputs] = useState<string[]>(chunks.map(() => ""));

  // Initialize results directly with initialProgress (no useEffect needed)
  const [results, setResults] = useState<(number | null)[]>(() => {
    const initialResults: (number | null)[] = chunks.map(() => null);
    if (initialProgress?.completedIndices && Array.isArray(initialProgress.completedIndices)) {
      initialProgress.completedIndices.forEach((idx: number) => {
        if (idx < initialResults.length) {
          initialResults[idx] = 100 as number; // Mark as perfect
        }
      });
    }
    return initialResults;
  });

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [showTextIndex, setShowTextIndex] = useState<number | null>(null);

  // Refs to access current values without causing re-renders
  const onProgressChangeRef = useRef(onProgressChange);
  const chunksLengthRef = useRef(chunks.length);

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
    chunksLengthRef.current = chunks.length;
  });

  // Stable callback using refs
  const saveProgress = useCallback((indices: number[]) => {
    if (onProgressChangeRef.current) {
      onProgressChangeRef.current("listening", indices.length, chunksLengthRef.current, indices);
    }
  }, []);

  const checkAnswer = useCallback((index: number) => {
    setInputs(currentInputs => {
      setResults(prevResults => {
        const expected = normalizeText(chunks[index]);
        const actual = normalizeText(currentInputs[index]);
        const acc = calculateAccuracy(expected, actual);

        const newResults = [...prevResults];
        newResults[index] = acc;

        // Schedule save after state update completes
        queueMicrotask(() => {
          const completedIndices = newResults
            .map((r, idx) => (r !== null && r >= 80 ? idx : null))
            .filter((idx): idx is number => idx !== null);

          if (completedIndices.length > 0) {
            saveProgress(completedIndices);
          }
        });

        return newResults;
      });

      setShowTextIndex(prev => prev === index ? null : prev);
      return currentInputs;
    });
  }, [chunks, saveProgress]);

  const completedCount = results.filter(r => r !== null && r >= 80).length;
  const progress = Math.round((completedCount / chunks.length) * 100);

  return (
    <div className="p-6 max-w-3xl">
      {/* Progress Tracker */}
      <div className="mb-6 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Progress</span>
          <span className="text-[10px] font-semibold text-stone-700">{completedCount}/{chunks.length} correct</span>
        </div>
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1b5f4a] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {chunks.map((chunk: string, index: number) => {
          const accuracy = results[index];
          const isChecked = accuracy !== null;
          const isFocused = focusedIndex === index;
          const showText = showTextIndex === index;
          
          return (
            <div
              key={index}
              ref={isFocused && activeChunkRef ? activeChunkRef : null}
              className={`group transition-colors ${
                isFocused ? (autoScroll ? "bg-violet-50" : "bg-stone-100") + " px-2 py-2 rounded-md" : accuracy !== null && accuracy >= 80 ? "bg-violet-100 px-2 py-2 rounded-md" : "py-1"
              }`}
            >
              {/* Audio control - minimal, top-aligned */}
              <div className="flex items-start gap-2 mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(chunk, index);
                    setFocusedIndex(index);
                  }}
                  className="mt-1 inline-flex opacity-40 hover:opacity-100 transition-opacity"
                  title="Listen to this sentence"
                  aria-label="Listen to this sentence"
                  disabled={loadingChunkIndex === index}
                >
                  {loadingChunkIndex === index ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#1b5f4a] animate-spin" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                  )}
                </button>
                
                <div className="flex-1">
                  {!isChecked ? (
                    <div className="space-y-1.5">
                      {/* Show/Hide text button for beginners */}
                      <button
                        onClick={() => setShowTextIndex(showText ? null : index)}
                        className="text-[10px] font-medium text-[#1b5f4a80] hover:text-[#1b5f4a] transition-colors mb-1"
                      >
                        {showText ? "Hide text" : "Show text (for beginners)"}
                      </button>

                      {/* Revealed text */}
                      {showText && (
                        <div className="text-xs text-stone-500 italic mb-2 p-2 bg-stone-50 rounded-md border border-[#1b5f4a20]">
                          {chunk}
                        </div>
                      )}

                      <input
                        type="text"
                        value={inputs[index]}
                        onChange={(e) => {
                          const newInputs = [...inputs];
                          newInputs[index] = e.target.value;
                          setInputs(newInputs);
                        }}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        placeholder="Type what you hear..."
                        className="w-full px-0 py-1 text-sm bg-transparent border-0 border-b border-stone-200 focus:border-primary focus:ring-0 placeholder:text-stone-400 text-stone-800"
                        aria-label="Type the sentence you heard"
                      />
                      {inputs[index].trim() && (
                        <button
                          onClick={() => checkAnswer(index)}
                          className="text-[10px] font-medium text-stone-600 hover:text-green-600 transition-colors"
                        >
                          Check answer →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Result indicator */}
                      <div className={`text-xs font-medium ${
                        accuracy >= 80 ? "text-[#dfecc8]" : accuracy >= 50 ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {accuracy >= 80 ? "✓ Perfect!" : accuracy >= 50 ? "~ Close" : "Try again"}
                        <span className="ml-1.5 text-stone-400">{accuracy}%</span>
                      </div>
                      
                      {/* Show correct answer if not perfect */}
                      {accuracy < 100 && (
                        <div className="text-sm text-stone-600 leading-relaxed pl-3 border-l-2 border-stone-200">
                          {chunk}
                        </div>
                      )}
                      
                      {/* Retry/Undo option */}
                      <button
                        onClick={() => {
                          const newResults = [...results];
                          newResults[index] = null;
                          setResults(newResults);
                          const newInputs = [...inputs];
                          newInputs[index] = "";
                          setInputs(newInputs);
                          setShowTextIndex(null);
                        }}
                        className="text-[10px] font-medium text-stone-500 hover:text-stone-700 transition-colors"
                      >
                        {accuracy >= 80 ? "↻ Undo" : "↻ Try again"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
