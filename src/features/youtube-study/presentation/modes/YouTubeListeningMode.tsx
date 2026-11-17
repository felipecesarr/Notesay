"use client";

import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { Volume2, Trash2, Check, X, Loader2 } from "lucide-react";
import { VideoChunk } from "./YouTubeReadAloudMode";
import { normalizeText, calculateAccuracy } from "@/features/read-aloud/procedure";

interface YouTubeListeningModeProps {
  chunks: VideoChunk[];
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  isPlaying: boolean;
  handlePlayChunk: (index: number) => void;
  onDeleteChunk?: (index: number) => Promise<void> | void;
  textId: string;
  initialProgress?: { completedChunks: number; totalChunks: number; completedIndices: number[] };
  onProgressChange?: (mode: string, completedChunks: number, totalChunks: number, completedIndices: number[]) => void;
  activeChunkRef?: React.RefObject<HTMLDivElement | null>;
  autoScroll?: boolean;
}

export const YouTubeListeningMode = memo(function YouTubeListeningMode({ 
  chunks, 
  currentChunkIndex, 
  setCurrentChunkIndex, 
  isPlaying, 
  handlePlayChunk,  
  onDeleteChunk,
  initialProgress, 
  onProgressChange, 
  activeChunkRef, 
  autoScroll 
}: YouTubeListeningModeProps) {
  const [inputs, setInputs] = useState<string[]>(chunks.map(() => ""));

  // Initialize results directly with initialProgress
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

  // Refs
  const onProgressChangeRef = useRef(onProgressChange);
  const chunksLengthRef = useRef(chunks.length);

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
    chunksLengthRef.current = chunks.length;
  });

  const saveProgress = useCallback((indices: number[]) => {
    if (onProgressChangeRef.current) {
      onProgressChangeRef.current("listening", indices.length, chunksLengthRef.current, indices);
    }
  }, []);

  const checkAnswer = useCallback((index: number) => {
    setInputs(currentInputs => {
      setResults(prevResults => {
        const expected = normalizeText(chunks[index].text);
        const actual = normalizeText(currentInputs[index]);
        const acc = calculateAccuracy(expected, actual);

        const newResults = [...prevResults];
        newResults[index] = acc;

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
        {chunks.map((chunk, index) => {
          const accuracy = results[index];
          const isChecked = accuracy !== null;
          const isFocused = focusedIndex === index;
          const showText = showTextIndex === index;
          const isCurrent = currentChunkIndex === index;
          
          return (
            <ListeningChunkItem 
                key={`${chunk.start}-${index}`}
                chunk={chunk}
                index={index}
                accuracy={accuracy}
                isChecked={isChecked}
                isFocused={isFocused}
                showText={showText}
                isCurrent={isCurrent}
                isPlaying={isPlaying}
                autoScroll={autoScroll}
                activeChunkRef={activeChunkRef}
                input={inputs[index]}
                setInput={(val: string) => {
                    const newInputs = [...inputs];
                    newInputs[index] = val;
                    setInputs(newInputs);
                }}
                handlePlayChunk={handlePlayChunk}
                setCurrentChunkIndex={setCurrentChunkIndex}
                setFocusedIndex={setFocusedIndex}
                setShowTextIndex={setShowTextIndex}
                checkAnswer={() => checkAnswer(index)}
                resetAnswer={() => {
                    const newResults = [...results];
                    newResults[index] = null;
                    setResults(newResults);
                    const newInputs = [...inputs];
                    newInputs[index] = "";
                    setInputs(newInputs);
                    setShowTextIndex(null);
                }}
                onDelete={() => onDeleteChunk?.(index)}
            />
          );
        })}
      </div>
    </div>
  );
});

const ListeningChunkItem = ({ 
    chunk, index, accuracy, isChecked, isFocused, showText, isCurrent, isPlaying, autoScroll, activeChunkRef,
    input, setInput, handlePlayChunk, setCurrentChunkIndex, setFocusedIndex, setShowTextIndex, checkAnswer, resetAnswer, onDelete
}: any) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div
        ref={isFocused && activeChunkRef ? activeChunkRef : null}
        className={`group transition-colors ${
        isFocused 
            ? (autoScroll ? "bg-[#dfecc870]" : "bg-stone-100") + " px-2 py-2 rounded-md" 
            : accuracy !== null && accuracy >= 80 
            ? "bg-[#dfecc870] px-2 py-2 rounded-md" 
            : "py-1"
        }`}
        onClick={() => setCurrentChunkIndex(index)}
    >
        <div className="flex items-start gap-2 mb-2">
            <div className="flex items-center">
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    handlePlayChunk(index);
                    setFocusedIndex(index);
                    }}
                    className="p-1 hover:bg-stone-200 rounded transition-colors"
                    title="Listen to this sentence"
                >
                    <Volume2 className={`w-3.5 h-3.5 ${isCurrent && isPlaying ? "text-[#1b5f4a] animate-pulse" : "text-stone-500"}`} />
                </button>

                {isConfirming ? (
                    <div className="flex items-center gap-2 px-1 py-0.5 animate-in fade-in zoom-in duration-200">
                        <span className="text-[10px] font-medium text-stone-500">
                            {isDeleting ? "Deleting..." : "Delete?"}
                        </span>
                        
                        {isDeleting ? (
                             <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />
                        ) : (
                            <>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        setIsDeleting(true);
                                        await onDelete?.();
                                    }}
                                    className="p-0.5 text-stone-500 hover:text-stone-900 transition-colors"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsConfirming(false);
                                    }}
                                    className="p-0.5 text-stone-400 hover:text-stone-600 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsConfirming(true);
                        }}
                        className="p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all text-stone-300 hover:text-stone-500 ml-1"
                        title="Delete chunk"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            
            <div className="flex-1">
                {!isChecked ? (
                <div className="space-y-1.5">
                    <button
                    onClick={() => setShowTextIndex(showText ? null : index)}
                    className="text-[10px] font-medium text-[#1b5f4a] hover:text-[#1b5f4a] transition-colors mb-1"
                    >
                    {showText ? "Hide text" : "Show text (for beginners)"}
                    </button>

                    {showText && (
                    <div className="text-xs text-[#1b5f4a] italic mb-2 p-2 bg-[#dfecc870] rounded-md">
                        {chunk.text}
                    </div>
                    )}

                    <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') checkAnswer();
                    }}
                    placeholder="Type what you hear..."
                    className="w-full px-0 py-1 text-sm bg-transparent border-0 border-b border-stone-200 focus:border-[#1b5f4a] focus:ring-0 placeholder:text-stone-400 text-stone-800"
                    />
                    {input.trim() && (
                    <button
                        onClick={() => checkAnswer()}
                        className="text-[10px] font-medium text-stone-600 hover:text-[#1b5f4a] transition-colors"
                    >
                        Check answer →
                    </button>
                    )}
                </div>
                ) : (
                <div className="space-y-2">
                    <div className={`text-xs font-medium ${
                    accuracy >= 80 ? "text-[#1b5f4a]" : accuracy >= 50 ? "text-violet-600" : "text-rose-600"
                    }`}>
                    {accuracy >= 80 ? "✓ Perfect!" : accuracy >= 50 ? "~ Close" : "Try again"}
                    <span className="ml-1.5 text-stone-400">{accuracy}%</span>
                    </div>
                    
                    {accuracy < 100 && (
                    <div className="text-sm text-stone-600 leading-relaxed pl-3 border-l-2 border-stone-200">
                        {chunk.text}
                    </div>
                    )}
                    
                    <button
                        onClick={() => resetAnswer()}
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
};
