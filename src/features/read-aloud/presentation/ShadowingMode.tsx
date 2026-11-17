"use client";

import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { Volume2, Loader2 } from "lucide-react";


interface ShadowingModeProps {
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

export const ShadowingMode = memo(function ShadowingMode({ chunks, currentChunkIndex, setCurrentChunkIndex, isPlaying, loadingChunkIndex, handleSpeak, initialProgress, onProgressChange, activeChunkRef, autoScroll }: ShadowingModeProps) {
  const [loopCount, setLoopCount] = useState<number | null>(null);
  const [loopingIndex, setLoopingIndex] = useState<number | null>(null);

  // Initialize state directly with initialProgress (no useEffect needed)
  const [completedChunks, setCompletedChunks] = useState<Set<number>>(() => {
    if (initialProgress?.completedIndices && Array.isArray(initialProgress.completedIndices)) {
      return new Set(initialProgress.completedIndices);
    }
    return new Set();
  });

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
      onProgressChangeRef.current("shadowing", indices.length, chunksLengthRef.current, indices);
    }
  }, []);

  useEffect(() => {
    if (loopCount !== null && loopCount > 0 && !isPlaying && loopingIndex !== null) {
      const timer = setTimeout(() => {
        handleSpeak(chunks[loopingIndex], loopingIndex);
        setLoopCount(loopCount - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (loopCount === 0 && loopingIndex !== null) {
      const newSet = new Set(completedChunks).add(loopingIndex);
      setTimeout(() => {
        setCompletedChunks(newSet);
        saveProgress(Array.from(newSet));
        setLoopCount(null);
      }, 0);
    }
  }, [loopCount, isPlaying, loopingIndex, chunks, handleSpeak, completedChunks, saveProgress]);

  const toggleComplete = useCallback((index: number) => {
    setCompletedChunks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      // Schedule save after state update completes
      queueMicrotask(() => {
        saveProgress(Array.from(newSet));
      });
      return newSet;
    });
  }, [saveProgress]);

  const progress = Math.round((completedChunks.size / chunks.length) * 100);

  return (
    <div className="p-6 max-w-3xl">
      {/* Progress Tracker */}
      <div className="mb-6 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Progress</span>
          <span className="text-[10px] font-semibold text-stone-700">{completedChunks.size}/{chunks.length} completed</span>
        </div>
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1b5f4a] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {chunks.map((chunk: string, index: number) => {
          const isCurrent = currentChunkIndex === index;
          const isLooping = loopingIndex === index && loopCount !== null;
          const isCompleted = completedChunks.has(index);
          
          return (
            <div
              key={index}
              ref={isCurrent && activeChunkRef ? activeChunkRef : null}
              className={`group relative transition-colors px-2 py-1 rounded-md ${
                isCompleted
                  ? "bg-[#dfecc8] hover:bg-[#dfecc870]"
                  : isCurrent
                    ? autoScroll ? "bg-[#dfecc870]" : "bg-stone-100"
                    : "hover:bg-stone-50"
              }`}
              onClick={() => setCurrentChunkIndex(index)}
            >
              <p className="text-base leading-relaxed cursor-pointer text-stone-800">
                {chunk}
                
                {/* Inline controls */}
                {(isCurrent || isLooping) && (
                  <span className="inline-flex items-center ml-2 gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(chunk, index);
                        setLoopingIndex(null);
                        setLoopCount(null);
                      }}
                      className="inline-flex opacity-40 hover:opacity-100 transition-opacity"
                      title="Listen to this chunk"
                      aria-label="Listen to this chunk"
                      disabled={loadingChunkIndex === index}
                    >
                      {loadingChunkIndex === index ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#1b5f4a] animate-spin" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLoopingIndex(index);
                        setLoopCount(3);
                        handleSpeak(chunk, index);
                      }}
                      className="px-1.5 py-0.5 text-[9px] font-medium text-[#1b5f4a] hover:bg-[#dfecc8] rounded-md transition-colors"
                      title="Loop 3 times"
                      aria-label="Loop this chunk 3 times"
                    >
                      {isLooping ? `${loopCount} left` : "Loop"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(index);
                      }}
                      className="px-1.5 py-0.5 text-[9px] font-medium text-stone-500 hover:bg-stone-100 rounded-md transition-colors"
                      title={isCompleted ? "Mark as undone" : "Mark as done"}
                      aria-label={isCompleted ? "Mark chunk as undone" : "Mark chunk as done"}
                    >
                      {isCompleted ? "↻ Undo" : "✓ Done"}
                    </button>
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
});
