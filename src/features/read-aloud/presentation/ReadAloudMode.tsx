import React, { RefObject } from "react";
import { Volume2, Loader2 } from "lucide-react";

interface ReadAloudModeProps {
  chunks: string[];
  currentChunkIndex: number;
  setCurrentChunkIndex: (index: number) => void;
  isPlaying: boolean;
  loadingChunkIndex: number | null;
  handleSpeak: (text: string, chunkIndex: number) => void;
  title: string;
  activeChunkRef?: RefObject<HTMLParagraphElement | HTMLDivElement | null>;
  autoScroll?: boolean;
}

export function ReadAloudMode({
  chunks,
  currentChunkIndex,
  setCurrentChunkIndex,
  loadingChunkIndex,
  handleSpeak,
  title,
  activeChunkRef,
  autoScroll = false
}: ReadAloudModeProps) {
  return (
    <div className="p-6 max-w-3xl">
      {/* Title as part of the document */}
      <h1 className="text-lg font-bold text-stone-900 mb-6 leading-tight">
        {title}
      </h1>

      {/* Continuous text flow */}
      <div className="space-y-4">
        {chunks.map((chunk: string, index: number) => {
          const isCurrent = currentChunkIndex === index;
          const isLoading = loadingChunkIndex === index;
          return (
            <p
              key={index}
              ref={isCurrent && activeChunkRef ? activeChunkRef : null}
              className={`group relative text-base leading-relaxed cursor-text transition-colors select-text ${
                isCurrent
                  ? autoScroll
                    ? "text-[#1b5f4a] text-sm bg-[#dfecc850] px-3 py-2 rounded-md"
                    : "text-stone-900 text-sm bg-stone-100 px-3 py-2 rounded-md"
                  : "text-stone-500 px-3 py-2 text-sm"
              }`}
            >
              {chunk}
              {/* Audio icon - shows spinner when loading */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentChunkIndex(index);
                  handleSpeak(chunk, index);
                }}
                disabled={isLoading}
                className={`inline-flex ml-2 align-middle transition-opacity ${
                  isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-40 hover:opacity-100!"
                } disabled:cursor-wait`}
                title={isLoading ? "Generating audio..." : "Play from here"}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-stone-500 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                )}
              </button>
            </p>
          );
        })}
      </div>
    </div>
  );
}
