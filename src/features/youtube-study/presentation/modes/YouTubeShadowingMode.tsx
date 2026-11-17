"use client";

import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { Volume2, Eye, EyeOff, Check, Infinity, Trash2, X, Loader2 } from "lucide-react";
import { VideoChunk } from "./YouTubeReadAloudMode";

interface YouTubeShadowingModeProps {
  chunks: VideoChunk[];
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  isPlaying: boolean;
  handlePlayChunk: (index: number, enableLoop?: boolean) => void;
  onDeleteChunk?: (index: number) => Promise<void> | void;
  textId: string;
  initialProgress?: { completedChunks: number; totalChunks: number; completedIndices: number[] };
  onProgressChange?: (mode: string, completedChunks: number, totalChunks: number, completedIndices: number[]) => void;
  activeChunkRef?: React.RefObject<HTMLDivElement | null>;
  autoScroll?: boolean;
}

export const YouTubeShadowingMode = memo(function YouTubeShadowingMode({ 
  chunks, 
  currentChunkIndex, 
  setCurrentChunkIndex, 
  isPlaying, 
  handlePlayChunk, 
  initialProgress, 
  onProgressChange, 
  activeChunkRef, 
  autoScroll,
  onDeleteChunk
}: YouTubeShadowingModeProps) {
  const [isLooping, setIsLooping] = useState(false);
  const [loopingIndex, setLoopingIndex] = useState<number | null>(null);

  const [hiddenChunks, setHiddenChunks] = useState<Set<number>>(new Set());

  // Initialize state directly with initialProgress
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

  const toggleComplete = useCallback((index: number) => {
    setCompletedChunks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      queueMicrotask(() => {
        saveProgress(Array.from(newSet));
      });
      return newSet;
    });
  }, [saveProgress]);

  const toggleVisibility = useCallback((index: number) => {
    setHiddenChunks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const progress = Math.round((completedChunks.size / chunks.length) * 100);

  return (
    <div className="p-6 max-w-3xl">
      {/* Header: Progress */}
      <div className="mb-6 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
             <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Progress</span>
             <span className="text-[10px] font-semibold text-stone-700">{completedChunks.size}/{chunks.length} completed</span>
          </div>
        </div>
        
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#dfecc870] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {chunks.map((chunk, index) => {
          const isCurrent = currentChunkIndex === index;
          const isLoopingChunk = loopingIndex === index && isLooping;
          const isCompleted = completedChunks.has(index);
          const isHidden = hiddenChunks.has(index);
          
          return (
            <ShadowingChunkItem 
                key={`${chunk.start}-${index}`}
                chunk={chunk}
                index={index}
                isCurrent={isCurrent}
                isLoopingChunk={isLoopingChunk}
                isCompleted={isCompleted}
                isHidden={isHidden}
                isPlaying={isPlaying}
                autoScroll={autoScroll}
                activeChunkRef={activeChunkRef}
                handlePlayChunk={handlePlayChunk}
                setCurrentChunkIndex={setCurrentChunkIndex}
                setIsLooping={setIsLooping}
                setLoopingIndex={setLoopingIndex}
                toggleComplete={() => toggleComplete(index)}
                toggleVisibility={() => toggleVisibility(index)}
                onDelete={() => onDeleteChunk?.(index)}
            />
          );
        })}
      </div>
    </div>
  );
});

interface ShadowingChunkItemProps {
    chunk: VideoChunk;
    index: number;
    isCurrent: boolean;
    isLoopingChunk: boolean;
    isCompleted: boolean;
    isHidden: boolean;
    isPlaying: boolean;
    autoScroll?: boolean;
    activeChunkRef?: React.RefObject<HTMLDivElement | null>;
    handlePlayChunk: (index: number, loop: boolean) => void;
    setCurrentChunkIndex: (index: number) => void;
    setIsLooping: (val: boolean) => void;
    setLoopingIndex: (val: number | null) => void;
    toggleComplete: () => void;
    toggleVisibility: () => void;
    onDelete: () => void;
}

const ShadowingChunkItem = ({ 
    chunk, index, isCurrent, isLoopingChunk, isCompleted, isHidden, isPlaying, autoScroll, activeChunkRef,
    handlePlayChunk, setCurrentChunkIndex, setIsLooping, setLoopingIndex, toggleComplete, toggleVisibility, onDelete
}: ShadowingChunkItemProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div
        ref={isCurrent && activeChunkRef ? activeChunkRef : null}
        className={`group relative transition-colors px-3 py-2 rounded-lg ${
        isCompleted
            ? "opacity-60 hover:opacity-100" 
            : isCurrent
            ? autoScroll ? "border-l-2 border-[#ADC397] bg-white" : "bg-stone-50"
            : "hover:bg-stone-50"
        }`}
        onClick={() => {
            setCurrentChunkIndex(index);
        }}
    >
        <div className="flex items-start gap-3">
            {/* Action Group (Left) */}
            <div className="flex items-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlayChunk(index, false); // Play once
                        setLoopingIndex(null);
                        setIsLooping(false);
                    }}
                    className={`shrink-0 p-1 rounded-md transition-colors ${
                        isCurrent && isPlaying && !isLoopingChunk
                        ? "text-[#1b5f4a] bg-[#dfecc850]"
                        : "text-stone-400 hover:text-stone-700"
                    }`}
                >
                    <Volume2 className={`w-3.5 h-3.5 ${isCurrent && isPlaying && !isLoopingChunk ? "animate-pulse" : ""}`} />
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
                                        // Component unmounts
                                    }}
                                    className="p-0.5 text-stone-500 hover:text-stone-900 transition-colors"
                                    title="Confirm"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsConfirming(false);
                                    }}
                                    className="p-0.5 text-stone-400 hover:text-stone-600 transition-colors"
                                    title="Cancel"
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
                {/* Text Content */}
                <div className="relative">
                    <p 
                        className={`text-sm leading-relaxed transition-all duration-300 ${
                        isCompleted 
                            ? "text-stone-400 line-through decoration-stone-300" 
                            : "text-stone-500"
                        } ${
                        isHidden ? "blur-sm select-none opacity-40 text-stone-200" : ""
                        }`}
                    >
                        {chunk.text}
                    </p>
                    
                    {/* Eye Overlay for Blurred Text */}
                    {isHidden && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility();
                            }}
                            className="bg-[#1b5f4a] text-[#dfecc8] px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 shadow-sm"
                         >
                           <Eye className="w-3 h-3" /> Reveal
                         </button>
                      </div>
                    )}
                </div>
                  
                {/* Inline controls */}
                <div className={`flex items-center gap-2 mt-1.5 transition-all duration-200 ${isCurrent || isLoopingChunk ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isLoopingChunk) {
                        handlePlayChunk(index, false);
                        setLoopingIndex(null);
                        setIsLooping(false);
                        } else {
                        handlePlayChunk(index, true);
                        setLoopingIndex(index);
                        setIsLooping(true);
                        }
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                        isLoopingChunk 
                            ? "bg-[#1b5f4a] text-white"
                        : "bg-[#dfecc880] text-[#1b5f4a] hover:bg-[#dfecc8]"
                    }`}
                    >
                    <Infinity className="w-3 h-3" />
                    {isLoopingChunk ? "Loop On" : "Loop"}
                    </button>

                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete();
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                        isCompleted 
                        ? "bg-[#1b5f4a] text-white"
                        : "bg-[#dfecc880] text-[#1b5f4a] hover:bg-[#dfecc8]"
                    }`}
                    >
                        {isCompleted ? <Check className="w-3 h-3" /> : null}
                    {isCompleted ? "Done" : "Mark Done"}
                    </button>
                    
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility();
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                        isHidden
                        ? "bg-[#1b5f4a] text-white"
                        : "bg-[#dfecc880] text-[#1b5f4a] hover:bg-[#dfecc8]"
                    }`}
                    title={isHidden ? "Show text" : "Hide text"}
                    >
                    {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {isHidden ? "Show" : "Hide"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
