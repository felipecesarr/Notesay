"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { PracticeText } from "../controller";
import { ReadAloudMode } from "./ReadAloudMode";
import { ShadowingMode } from "./ShadowingMode";
import { ListeningMode } from "./ListeningMode";
import { ttsService } from "@/meetmate/services/ai/tts";

type PracticeMode = "read-aloud" | "shadowing" | "listening";

interface ProgressData {
  shadowing?: { completedChunks: number; totalChunks: number; completedIndices: number[] };
  listening?: { completedChunks: number; totalChunks: number; completedIndices: number[] };
  [key: string]: { completedChunks: number; totalChunks: number; completedIndices: number[] } | undefined;
}

interface PracticePlayerProps {
  text: PracticeText;
  onBack: () => void;
  progressData?: ProgressData;
  onProgressChange?: (mode: string, completedChunks: number, totalChunks: number, completedIndices: number[]) => void;
}

export function PracticePlayer({ text, onBack, progressData, onProgressChange }: PracticePlayerProps) {
  const [mode, setMode] = useState<PracticeMode>("read-aloud");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingChunkIndex, setLoadingChunkIndex] = useState<number | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  // Different chunking strategies for different modes (memoized)
  const createChunks = useCallback((maxWords: number): string[] => {
    const sentences = text.content.match(/[^.!?]+[.!?]+/g) || [text.content];
    const grouped: string[] = [];
    let buffer = "";

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (buffer.length === 0) {
        buffer = trimmed;
      } else if ((buffer + " " + trimmed).split(/\s+/).length <= maxWords) {
        buffer += " " + trimmed;
      } else {
        grouped.push(buffer);
        buffer = trimmed;
      }
    });
    if (buffer) grouped.push(buffer);

    return grouped.length > 0 ? grouped : [text.content];
  }, [text.content]);

  // Smart chunking for listening mode - keep semantic phrases intact, target ~12 words
  const createListeningChunks = useCallback((): string[] => {
    // Split by sentence boundaries first
    const sentences = text.content.match(/[^.!?]+[.!?]+/g) || [text.content];
    const chunks: string[] = [];

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      const words = trimmed.split(/\s+/);

      // If sentence is already ≤12 words, keep it whole
      if (words.length <= 12) {
        chunks.push(trimmed);
        return;
      }

      // For longer sentences, split at natural phrase boundaries (commas, conjunctions)
      // but try to keep chunks around 8-12 words
      const parts = trimmed.split(/,\s+|;\s+/);
      let buffer = "";

      parts.forEach((part) => {
        const partWords = part.trim().split(/\s+/).length;
        const bufferWords = buffer.split(/\s+/).filter(w => w).length;

        if (bufferWords === 0) {
          buffer = part.trim();
        } else if (bufferWords + partWords <= 12) {
          buffer += ", " + part.trim();
        } else {
          chunks.push(buffer);
          buffer = part.trim();
        }
      });

      if (buffer) chunks.push(buffer);
    });

    return chunks.length > 0 ? chunks : [text.content];
  }, [text.content]);

  // Memoized chunks for each mode
  // Large chunks for Read Aloud (60 words) - for natural reading flow
  const readAloudChunks = useMemo(() => createChunks(60), [createChunks]);

  // Medium chunks for Shadowing (20 words) - for repetition practice
  const shadowingChunks = useMemo(() => createChunks(20), [createChunks]);

  // Smart chunks for Listening (1-12 words) - semantic phrases for dictation
  const listeningChunks = useMemo(() => createListeningChunks(), [createListeningChunks]);

  // Check if TTS service is available
  const isTTSAvailable = ttsService.isAvailable();

  // Memoized speech handlers using Gemini TTS
  const handleSpeak = useCallback(async (textToSpeak: string, chunkIndex: number) => {
    if (!isTTSAvailable) {
      alert('Text-to-speech service is not available.');
      return;
    }

    setLoadingChunkIndex(chunkIndex);
    setIsPlaying(true);

    await ttsService.speak(
      textToSpeak,
      () => {
        setIsPlaying(false);
        setLoadingChunkIndex(null);
      },
      (error) => {
        console.error("TTS error:");
        setIsPlaying(false);
        setLoadingChunkIndex(null);
        alert('Failed to play audio. Please try again.');
      }
    );
  }, [isTTSAvailable]);

  const stopSpeaking = useCallback(() => {
    ttsService.stop();
    setIsPlaying(false);
    setLoadingChunkIndex(null);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white scrollbar-hide">
      {/* TTS Availability Warning */}
      {!isTTSAvailable && (
        <div className="px-3 py-2 bg-[#dfecc8] border-b border-[#1b5f4a] text-center">
          <p className="text-xs text-[#1b5f4a]">
            ⚠️ Text-to-speech service is not available. Audio features will be disabled.
          </p>
        </div>
      )}

      {/* Header with Mode Selector Only */}
      <div className="px-6 pt-6 flex items-start gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-6 w-6 -ml-1 shrink-0 bg-transparent hover:bg-transparent"
          aria-label="Go back to library"
        >
          <ChevronLeft className="w-4 h-4 text-stone-400" />
        </Button>
        <select
          value={mode}
          onChange={(e) => {
            stopSpeaking();
            setMode(e.target.value as PracticeMode);
            setCurrentChunkIndex(0);
          }}
          className="ml-auto px-2 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-sm"
          aria-label="Select practice mode"
        >
          <option value="read-aloud">Read Aloud</option>
          <option value="shadowing">Shadowing</option>
          <option value="listening">Listening</option>
        </select>
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
        }}
      >
        {mode === "read-aloud" && <ReadAloudMode chunks={readAloudChunks} currentChunkIndex={currentChunkIndex} setCurrentChunkIndex={setCurrentChunkIndex} isPlaying={isPlaying} loadingChunkIndex={loadingChunkIndex} handleSpeak={handleSpeak} title={text.title} />}
        {mode === "shadowing" && <ShadowingMode chunks={shadowingChunks} currentChunkIndex={currentChunkIndex} setCurrentChunkIndex={setCurrentChunkIndex} isPlaying={isPlaying} loadingChunkIndex={loadingChunkIndex} handleSpeak={handleSpeak} textId={text.id} initialProgress={progressData?.shadowing} onProgressChange={onProgressChange} />}
        {mode === "listening" && <ListeningMode chunks={listeningChunks} currentChunkIndex={currentChunkIndex} setCurrentChunkIndex={setCurrentChunkIndex} isPlaying={isPlaying} loadingChunkIndex={loadingChunkIndex} handleSpeak={handleSpeak} textId={text.id} initialProgress={progressData?.listening} onProgressChange={onProgressChange} />}
      </div>
    </div>
  );
}
