"use client";

import React, { RefObject } from "react";
import { Volume2, Trash2, Check, X, Loader2 } from "lucide-react";

export interface VideoChunkSegment {
  text: string;
  start: number;
}

export interface VideoChunk {
  text: string;
  start: number;
  end: number;
  segments?: VideoChunkSegment[];
}

// interface WordTiming {
//   word: string;
//   start: number;
//   end: number;
// }

// /**
//  * Calcula o timing de cada palavra baseado no comprimento proporcional.
//  * Palavras longas recebem mais tempo, palavras curtas recebem menos.
//  * Adiciona pausas naturais após pontuação.
//  */
// function calculateWordTimings(
//   words: string[],
//   segmentStart: number,
//   segmentDuration: number,
//   includePauses: boolean = true
// ): WordTiming[] {
//   if (words.length === 0) return [];
//   if (words.length === 1) {
//     return [{ word: words[0], start: segmentStart, end: segmentStart + segmentDuration }];
//   }

//   // Durações de pausa após pontuação (em segundos)
//   const pauseDurations: Record<string, number> = {
//     '.': 0.25, '!': 0.25, '?': 0.25,
//     ',': 0.12, ':': 0.15, ';': 0.15,
//   };

//   // Calcula peso de cada palavra baseado no comprimento
//   const wordWeights = words.map((word) => {
//     // Remove pontuação para cálculo de comprimento
//     const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, '');
//     // Peso mínimo de 2 para palavras muito curtas (artigos, preposições)
//     let weight = Math.max(2, cleanWord.length);
//     // Bonus para palavras longas (mais sílabas = mais tempo)
//     if (weight > 8) {
//       weight *= 1.15;
//     }
//     return weight;
//   });

//   // Calcula tempo total de pausas
//   let totalPauseTime = 0;
//   const pauseAfterWord = words.map((word) => {
//     if (!includePauses) return 0;
//     const lastChar = word[word.length - 1];
//     const pauseTime = pauseDurations[lastChar] || 0;
//     totalPauseTime += pauseTime;
//     return pauseTime;
//   });

//   // Limita pausas a máximo 30% do tempo total
//   const pauseScale = Math.min(1, (segmentDuration * 0.3) / Math.max(totalPauseTime, 0.001));

//   // Tempo disponível para as palavras (descontando pausas)
//   const availableTime = segmentDuration - (totalPauseTime * pauseScale);

//   // Peso total
//   const totalWeight = wordWeights.reduce((sum, w) => sum + w, 0);

//   // Calcula timings
//   const timings: WordTiming[] = [];
//   let currentTime = segmentStart;

//   words.forEach((word, idx) => {
//     const wordDuration = (wordWeights[idx] / totalWeight) * availableTime;
//     timings.push({
//       word,
//       start: currentTime,
//       end: currentTime + wordDuration,
//     });
//     currentTime += wordDuration + (pauseAfterWord[idx] * pauseScale);
//   });

//   return timings;
// }

interface YouTubeReadAloudModeProps {
  chunks: VideoChunk[];
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  isPlaying: boolean;
  handlePlayChunk: (index: number) => void;
  title: string;
  activeChunkRef?: RefObject<HTMLParagraphElement | HTMLDivElement | null>;
  autoScroll?: boolean;
  currentTime: number;
  onDeleteChunk?: (index: number) => Promise<void> | void;
}

export function YouTubeReadAloudMode({
  chunks,
  currentChunkIndex,
  setCurrentChunkIndex,
  isPlaying,
  handlePlayChunk,
  title,
  activeChunkRef,
  autoScroll = false,
  currentTime,
  onDeleteChunk
}: YouTubeReadAloudModeProps) {
  return (
    <div className="p-6 max-w-3xl">
      {/* Title */}
      <h1 className="text-lg font-bold text-stone-900 my-6 leading-tight">
        {title}
      </h1>

      {/* Continuous text flow */}
      <div className="space-y-4">
        {chunks.map((chunk, index) => (
          <ChunkItem
            key={`${chunk.start}-${index}`}
            chunk={chunk}
            isCurrent={currentChunkIndex === index}
            isPlaying={isPlaying}
            currentTime={currentTime}
            autoScroll={autoScroll}
            activeChunkRef={activeChunkRef as React.RefObject<HTMLParagraphElement | null>}
            onPlay={() => {
              setCurrentChunkIndex(index);
              handlePlayChunk(index);
            }}
            onDelete={() => onDeleteChunk?.(index)}
          />
        ))}
      </div>
    </div>
  );
}

const ChunkItem = React.memo(({ 
  chunk, 
  isCurrent, 
  isPlaying, 
  currentTime, 
  autoScroll, 
  activeChunkRef,
  onPlay,
  onDelete
}: { 
  chunk: VideoChunk; 
  isCurrent: boolean; 
  isPlaying: boolean; 
  currentTime: number; 
  autoScroll: boolean;
  activeChunkRef?: React.RefObject<HTMLParagraphElement | HTMLDivElement | null>;
  onPlay: () => void;
  onDelete?: () => Promise<void> | void;
}) => {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isHeader = /^#+\s/.test(chunk.text);
  const isListItem = /^[\*\-]\s/.test(chunk.text);
  
  const baseClasses = "group relative cursor-text transition-all select-text rounded-md";
  const activeClasses = isCurrent 
        ? autoScroll
            ? "text-stone-500 border-l-2 border-[#ADC397] bg-white"
            : "text-stone-900 bg-stone-100"
        : "text-stone-500 hover:text-stone-600 hover:bg-stone-50/50";

  // Conditional Styling
  const structureClasses = isHeader 
      ? "text-lg font-bold mt-4 mb-2 px-3 py-2" 
      : isListItem 
      ? "ml-4 pl-4 border-l-2 border-stone-200 py-1 px-2"
      : "text-sm leading-relaxed px-3 py-2";

  return (
    <div
      ref={isCurrent && activeChunkRef ? activeChunkRef as React.RefObject<HTMLDivElement> : null}
      className={`${baseClasses} ${activeClasses} ${structureClasses}`}
    >
      {(chunk.segments && chunk.segments.length > 0 ? chunk.segments : [{ text: chunk.text, start: chunk.start }]).map((segment, segIdx, allSegments) => {
        const segmentStart = segment.start;
        const nextSegmentStart = allSegments[segIdx + 1]?.start || chunk.end;

        // Verifica se o segmento inteiro está ativo
        const isSegmentActive = isCurrent && isPlaying &&
          currentTime >= segmentStart && currentTime < nextSegmentStart;

        return (
          <span
            key={segIdx}
            className={`transition-all duration-400 ease-in-out ${
              isSegmentActive
                ? "font-bold text-stone-900 opacity-100"
                : "opacity-50"
            }`}
          >
            {segment.text}{" "}
          </span>
        );
      })}
      
      {/* Action Buttons */}
      <span className={`inline-flex items-center gap-1.5 ml-2 align-middle transition-all duration-200 ${
        isCurrent || isConfirming ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}>
        {isConfirming ? (
            <span className="flex items-center gap-2 px-1.5 py-0.5 rounded-sm animate-in fade-in zoom-in duration-200">
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
                                // We don't need to unset isDeleting because the component will unmount
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
            </span>
        ) : (
            <>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay();
                    }}
                    className="p-1 hover:bg-stone-100/50 rounded-sm transition-colors"
                    title="Play from here"
                >
                    <Volume2 className={`w-3.5 h-3.5 ${isCurrent && isPlaying ? "text-[#ADC397] animate-pulse" : "text-stone-300"}`} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsConfirming(true);
                    }}
                    className="p-1 text-stone-300 hover:text-stone-500 rounded-sm transition-colors"
                    title="Delete chunk"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </>
        )}
      </span>
    </div>
  );
}, (prev, next) => {
  if (prev.isCurrent !== next.isCurrent) return false;
  if (prev.isPlaying !== next.isPlaying) return false;
  
  // If playing, re-render current chunk on time changes
  if (next.isCurrent && next.isPlaying) {
    return Math.abs(prev.currentTime - next.currentTime) < 0.05; // Only re-render if time moved significantly enough to hit a word boundary
  }
  
  return true;
});

ChunkItem.displayName = "ChunkItem";
