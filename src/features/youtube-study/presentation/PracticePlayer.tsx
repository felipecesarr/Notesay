"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp, Info, RotateCcw, Play, Pause, RotateCw, ListVideo } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { YouTubeStudy } from "../controller";
import { YouTubeReadAloudMode, VideoChunk, VideoChunkSegment } from "./modes/YouTubeReadAloudMode";
import { YouTubeShadowingMode } from "./modes/YouTubeShadowingMode";
import { YouTubeListeningMode } from "./modes/YouTubeListeningMode";
import { useTextSelection } from "@/core/hooks/use-text-selection";
import { TextHighlightPopover } from "@/features/ai-interaction/presentation/TextHighlightPopover";
import { useTTS } from "@/features/ai-interaction/presentation/hooks/useTTS";
import { useRouter } from "next/navigation";
import { deletePDFChunk } from "@/features/pdf-study/controller";

// YouTube IFrame API types
interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data?: number;
}

interface YouTubePlayerOptions {
  videoId: string;
  width?: string;
  height?: string;
  playerVars?: {
    enablejsapi?: number;
    origin?: string;
  };
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
  };
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string | HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

type PracticeMode = "read-aloud" | "shadowing" | "listening";

interface ProgressMap {
  shadowing?: { completedChunks: number; totalChunks: number; completedIndices: number[] };
  listening?: { completedChunks: number; totalChunks: number; completedIndices: number[] };
}

interface PracticePlayerProps {
  study: Partial<YouTubeStudy> & { id: string; title: string; extractedContent: string; summary?: string | null; videoUrl?: string };
  onBack: () => void;
  progressData?: ProgressMap;
  onProgressChange?: (mode: string, completedChunks: number, totalChunks: number, completedIndices: number[]) => void;
  onAskAbout?: (text: string) => void;
  isPdfMode?: boolean;
}

export function PracticePlayer({ study, onBack, progressData, onProgressChange, onAskAbout, isPdfMode = false }: PracticePlayerProps) {
  const [mode, setMode] = useState<PracticeMode>("read-aloud");
  const router = useRouter(); // For refreshing data after delete
  // isPlaying tracks general playback state (video or TTS)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isVideoExpanded, setIsVideoExpanded] = useState(!isPdfMode);
  const [showSummary, setShowSummary] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [deletedTexts, setDeletedTexts] = useState<Set<string>>(new Set());
  
  // New state for "Stop at End" logic
  const [stopAtTime, setStopAtTime] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeChunkRef = useRef<HTMLParagraphElement | HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const lastLoopTimeRef = useRef<number>(0);

  // Text selection for learning
  const { selectedText, isOpen, handleClose } = useTextSelection(contentContainerRef);

  // TTS Hook
  const { speak: ttsSpeak, stop: ttsStop, isSpeaking: isTtsSpeaking } = useTTS();

  // Extract video ID for YouTube API (only if not PDF)
  const videoId = !isPdfMode && study.videoUrl 
    ? (study.videoUrl.includes('v=') ? study.videoUrl.split('v=')[1].split('&')[0] : study.videoUrl.split('/').pop() || '')
    : '';

  // Helper to parse timestamp [MM:SS] -> seconds
  const parseTimestamp = useCallback((text: string): number => {
    const match = text.match(/\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/);
    if (match) {
      const hours = match[3] ? parseInt(match[1]) : 0;
      const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
      const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return -1; // No timestamp found
  }, []);

  // Load YouTube IFrame API and initialize player
  useEffect(() => {
    if (isPdfMode) return;
    if (!videoId) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      if (playerContainerRef.current && !playerRef.current) {
        const playerDiv = document.createElement('div');
        playerDiv.id = `youtube-player-${videoId}`;
        playerContainerRef.current.appendChild(playerDiv);

        playerRef.current = new window.YT.Player(playerDiv, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      }
    }

    function onPlayerReady(event: YouTubePlayerEvent) {
      const player = event.target;
      setDuration(player.getDuration());

      // Update current time every 100ms (faster for better stop precision)
      intervalRef.current = setInterval(() => {
        if (player && player.getCurrentTime) {
          const time = player.getCurrentTime();
          setCurrentTime(time);
        }
      }, 100);
    }

    function onPlayerStateChange(event: YouTubePlayerEvent) {
      if (event.data === 1) { // PLAYING
        setIsPlaying(true);
      } else if (event.data === 2) { // PAUSED
        setIsPlaying(false);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, isPdfMode]);

  // Sync isPlaying with TTS state for PDF mode
  // AND handle a dummy timer for word highlighting in PDF mode
  useEffect(() => {
    if (isPdfMode) {
      setIsPlaying(isTtsSpeaking);
      
      if (isTtsSpeaking) {
          // Update currentTime every 100ms to simulate progress
          intervalRef.current = setInterval(() => {
              setCurrentTime(prev => prev + 0.1);
          }, 100);
      } else if (intervalRef.current) {
          clearInterval(intervalRef.current);
      }
    }
    
    return () => {
        if (isPdfMode && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
  }, [isTtsSpeaking, isPdfMode]);


  // --- Chunking Logic (Returns VideoChunk objects) ---
  const createChunks = useCallback((maxWords: number): VideoChunk[] => {
    const timestampPattern = /(\[\d{1,2}:\d{2}(?::\d{2})?\])/g;
    // Check if we have timestamps
    const hasTimestamps = timestampPattern.test(study.extractedContent);
    
    // If no timestamps (common in PDF), we generate synthetic chunks based on word count
    // If no timestamps (common in PDF), we generate synthetic chunks based on word count
    if (!hasTimestamps) {
        // Advanced PDF Chunking: Respect structure
        const chunks: VideoChunk[] = [];
        let currentSeconds = 0;
        const WORDS_PER_SECOND = 2.5;

        // Split by logical blocks (newlines) to preserve headers/paragraphs
        const blocks = study.extractedContent.split(/\n+/);

        for (const block of blocks) {
            const text = block.trim();
            if (!text) continue;

            // 1. Detect Headers (# Header) or List Items (* Item)
            // We keep these as distinct chunks to allow UI to style them
            const isHeader = /^#+\s/.test(text);
            const isListItem = /^[\*\-]\s/.test(text);

            if (isHeader || isListItem) {
                // Add as single chunk
                const wordCount = text.split(/\s+/).length;
                chunks.push({
                    text: text,
                    start: currentSeconds,
                    end: currentSeconds + Math.max(1, wordCount / WORDS_PER_SECOND), // Min 1 sec
                });
                currentSeconds += Math.max(1, wordCount / WORDS_PER_SECOND);
                continue;
            }

            // 2. Normal Paragraphs - Split by sentences
            const sentences = text.replace(/([.!?])\s+(?=[A-Z])/g, "$1|").split("|");
            
            let currentText = "";
            let chunkStartSeconds = currentSeconds;

            for (const sentence of sentences) {
                 const trimmedSentence = sentence.trim();
                 if (!trimmedSentence) continue;

                 const wordCount = trimmedSentence.split(/\s+/).length;
                 const currentWordCount = currentText.split(/\s+/).length;
                 
                 // If adding this sentence exceeds limit, push current and start new
                 if (currentText && (currentWordCount + wordCount > maxWords)) {
                     const duration = currentWordCount / WORDS_PER_SECOND;
                     chunks.push({
                         text: currentText.trim(),
                         start: chunkStartSeconds,
                         end: chunkStartSeconds + duration,
                     });
                     
                     chunkStartSeconds += duration;
                     currentSeconds += duration;
                     currentText = "";
                 }
                 
                 currentText += (currentText ? " " : "") + trimmedSentence;
            }
            
            // Push remaining text in this block
            if (currentText.trim()) {
                const wordCount = currentText.split(/\s+/).length;
                const duration = wordCount / WORDS_PER_SECOND;
                chunks.push({
                    text: currentText.trim(),
                    start: chunkStartSeconds,
                    end: chunkStartSeconds + duration,
                });
                currentSeconds += duration;
            }
        }
        
        return chunks;
    }

    // Existing Logic for Timestamped content
    const parts = study.extractedContent.split(timestampPattern).filter(Boolean);

    const chunks: VideoChunk[] = [];
    let currentText = "";
    let currentSegments: VideoChunkSegment[] = [];
    let currentStart = -1;
    let wordCount = 0;
    let lastTimestamp = -1;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (timestampPattern.test(part)) {
        // It's a timestamp
        const time = parseTimestamp(part);
        lastTimestamp = time;
        
        // If this is the first timestamp of a new chunk, record it
        if (currentStart === -1) {
          currentStart = time;
        }

        // Check if we should split here
        const endsWithSentence = /[.!?]["']?\s*$/.test(currentText);
        const hasEnoughWords = wordCount >= maxWords;
        const hasTooManyWords = wordCount >= maxWords * 1.5;

        if (currentText && ((hasEnoughWords && endsWithSentence) || hasTooManyWords)) {
          if (currentText.trim()) {
            chunks.push({
              text: currentText.trim(),
              start: currentStart,
              end: time,
              segments: [...currentSegments]
            });
            
            // Reset for next chunk
            currentText = "";
            currentSegments = [];
            currentStart = time;
            wordCount = 0;
          }
        }
      } else {
        // It's text
        const text = part.trim();
        if (!text) continue;

        if (lastTimestamp !== -1) {
          currentSegments.push({ text, start: lastTimestamp });
        }

        currentText += (currentText ? " " : "") + text;
        wordCount += text.split(/\s+/).length;
      }
    }

    // Add final chunk
    if (currentText.trim() && currentStart !== -1) {
      chunks.push({
        text: currentText.trim(),
        start: currentStart,
        end: duration || currentStart + 10,
        segments: currentSegments
      });
    }

    return chunks;
  }, [study.extractedContent, duration, parseTimestamp, isPdfMode]);

  // Smart chunking for listening (sentence based) - reused for PDF mostly
  const createListeningChunks = useCallback((): VideoChunk[] => {
      // Reuse logic roughly but smaller chunks
      return createChunks(20);
  }, [createChunks]);

  // Memoized chunks with filtering for deleted items
  const readAloudChunks = useMemo(() => 
    createChunks(60).filter(c => !deletedTexts.has(c.text)), 
  [createChunks, deletedTexts]);

  const shadowingChunks = useMemo(() => 
    createChunks(20).filter(c => !deletedTexts.has(c.text)), 
  [createChunks, deletedTexts]);

  const listeningChunks = useMemo(() => 
    createListeningChunks().filter(c => !deletedTexts.has(c.text)), 
  [createListeningChunks, deletedTexts]);
  
  // Set duration for PDF based on synthetic chunks
  useEffect(() => {
      if (isPdfMode && readAloudChunks.length > 0) {
          setDuration(readAloudChunks[readAloudChunks.length - 1].end);
      }
  }, [isPdfMode, readAloudChunks]);


  // Check if we need to stop playback (for Shadowing/Listening modes)
  // NOTE: For PDF/TTS mode, this loop is less effective as TTS is not continuous unless we queue it.
  // For PDF, we just let TTS finish playing the chunk (it auto-stops).
  useEffect(() => {
    if (isPdfMode) return; // Skip for PDF, handle stop differently

    if (stopAtTime !== null && isPlaying && playerRef.current) {
      if (currentTime >= stopAtTime) {
        // Debounce loop/stop trigger to prevent stale time from causing double-triggers
        const now = Date.now();
        if (now - lastLoopTimeRef.current < 1000) return;
        
        if (isLooping) {
          // Loop: Seek back to start of current chunk
          const chunks = mode === "read-aloud" ? readAloudChunks : mode === "shadowing" ? shadowingChunks : listeningChunks;
          const currentChunk = chunks[currentChunkIndex];
          if (currentChunk) {
            lastLoopTimeRef.current = now;
            playerRef.current.seekTo(currentChunk.start, true);
            // Optimistically update state in next tick
            setTimeout(() => setCurrentTime(currentChunk.start), 0);
          } else {
             playerRef.current.pauseVideo();
             setTimeout(() => setStopAtTime(null), 0);
          }
        } else {
          // Stop
          playerRef.current.pauseVideo();
          setTimeout(() => setStopAtTime(null), 0);
        }
      }
    }
  }, [currentTime, stopAtTime, isPlaying, isLooping, mode, readAloudChunks, shadowingChunks, listeningChunks, currentChunkIndex, isPdfMode]);

  // Sync currentChunkIndex with video playback
  useEffect(() => {
    if (!isPlaying || !autoScroll) return;
    
    // For PDF, TTS drives this, so we don't sync from time unless we simulated time. 
    // Actually, we just manually set chunk index when clicking play.
    if (isPdfMode) return;

    const chunks = mode === "read-aloud" ? readAloudChunks : mode === "shadowing" ? shadowingChunks : listeningChunks;

    // Find chunk that contains currentTime
    const index = chunks.findIndex(chunk => currentTime >= chunk.start && currentTime < chunk.end);
    
    if (index !== -1 && index !== currentChunkIndex) {
      setTimeout(() => setCurrentChunkIndex(index), 0);
    }
  }, [isPlaying, autoScroll, currentTime, mode, readAloudChunks, shadowingChunks, listeningChunks, currentChunkIndex, isPdfMode]);

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll) return;
    const timeoutId = setTimeout(() => {
      if (activeChunkRef.current) {
        activeChunkRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [currentChunkIndex, autoScroll]);

  // Play specific chunk
  const handlePlayChunk = useCallback((chunkIndex: number, enableLoop: boolean = false) => {
    const chunks = mode === "read-aloud" ? readAloudChunks : mode === "shadowing" ? shadowingChunks : listeningChunks;
    const chunk = chunks[chunkIndex];
    
    if (!chunk) return;

    // PDF Mode: Speak chunk
    if (isPdfMode) {
        // If already speaking this chunk, stop/toggle? 
        // Simple logic Stop any current, play new.
        ttsStop();
        
        // Clean text for TTS
        const textToSpeak = chunk.text
            .replace(/```[\s\S]*?```/g, "") // Remove code blocks
            .replace(/\*\*/g, "") // Remove bold markdown
            .replace(/\*/g, "") // Remove italic markdown
            .replace(/__ /g, "")
            .replace(/_/g, "")
            .replace(/#+/g, "") // Remove header markdown
            .replace(/`/g, "") // Remove inline code markdown
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links: [text](url) -> text
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Images
            .replace(/\n+/g, ". "); // Newlines to pauses;
        
        // Small delay to ensure stop processes
        setTimeout(() => {
            ttsSpeak(textToSpeak);
            setCurrentChunkIndex(chunkIndex);
            setCurrentTime(chunk.start); // Start timer from chunk start
            setIsPlaying(true);
            setIsLooping(enableLoop); // Looping with TTS not fully impl, just single play
        }, 50);
        return;
    }

    // YouTube Mode
    if (!playerRef.current) return;

    void 0;

    // Reset loop debounce
    lastLoopTimeRef.current = 0;

    playerRef.current.seekTo(chunk.start, true);
    playerRef.current.playVideo();
    setCurrentChunkIndex(chunkIndex);
    setCurrentTime(chunk.start); // Optimistic update
    setIsPlaying(true);
    setIsLooping(enableLoop);

    // Only set stop time for Shadowing and Listening modes
    if (mode === "shadowing" || mode === "listening") {
      setStopAtTime(chunk.end);
    } else {
      setStopAtTime(null); // Read Aloud plays continuously
    }

    if (!isVideoExpanded) setIsVideoExpanded(true);
  }, [mode, readAloudChunks, shadowingChunks, listeningChunks, isVideoExpanded, isPdfMode, ttsSpeak, ttsStop]);

  // Controls
  const handlePlayPause = () => {
    if (isPdfMode) {
        if (isTtsSpeaking) ttsStop();
        else handlePlayChunk(currentChunkIndex); // Resume/replay current
        return;
    }

    if (playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkipBackward = () => {
      const idx = Math.max(0, currentChunkIndex - 1);
      handlePlayChunk(idx);
  };

  const handleSkipForward = () => {
      const chunks = mode === "read-aloud" ? readAloudChunks : mode === "shadowing" ? shadowingChunks : listeningChunks;
      const idx = Math.min(chunks.length - 1, currentChunkIndex + 1);
      handlePlayChunk(idx);
  };

  const handleDeleteChunk = async (index: number) => {
    const chunks = mode === "read-aloud" ? readAloudChunks : mode === "shadowing" ? shadowingChunks : listeningChunks;
    const chunkToDelete = chunks[index];
    if (!chunkToDelete) return;

    // If deleting current, stop playing
    if (index === currentChunkIndex) {
      if (isPlaying) {
          if (isPdfMode) ttsStop();
          else if (playerRef.current) playerRef.current.pauseVideo();
          setIsPlaying(false);
      }
    }

    // Persistent Delete (Server Action)
    if (isPdfMode) {
        try {
            // We wait for the server action so the UI can show loading
            const result = await deletePDFChunk(study.id, chunkToDelete.text);
            if (result.success) {
                setDeletedTexts(prev => {
                    const next = new Set(prev);
                    next.add(chunkToDelete.text);
                    return next;
                });
                
                router.refresh(); 
            } else {
                console.error("Failed to delete chunk:");
            }
        } catch (err) {
            console.error("Error deleting chunk:");
        }
    } else {
        // Non-persistent (YouTube) - immediate update
        setDeletedTexts(prev => {
          const next = new Set(prev);
          next.add(chunkToDelete.text);
          return next;
        });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={contentContainerRef} className="flex flex-col h-full w-full bg-white rounded-4xl border border-stone-200/50 shadow-sm overflow-hidden relative">
      {/* Header with Video Player and Controls */}
      <div className="px-3 md:px-5 pt-3 md:pt-5 flex flex-col shrink-0 gap-2">
        {/* Back Button - Mobile at top, Desktop hidden (shown in controls) */}
        <div className="flex md:hidden justify-end">
          <Button variant="ghost" onClick={onBack} className="px-3 py-1 bg-stone-50 hover:bg-stone-100 rounded-md">
            <span className="text-stone-400 text-xs font-medium">Back to library</span>
          </Button>
        </div>

        {/* Video Player and Controls Container */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          {/* Left Side: Video Player (Hidden if PDF) and Controls */}
          <div className="flex flex-col w-full md:w-auto md:shrink-0">
            {/* YouTube Video Player - Collapsible */}
            {!isPdfMode && (
            <div className={`mb-3 ${isVideoExpanded ? '' : 'hidden'}`}>
              <div
                ref={playerContainerRef}
                className="w-full lg:w-[600px] max-w-[600px] aspect-video rounded-xl overflow-hidden bg-stone-200"
              />
            </div>
            )}

            {/* Controls Bar */}
            <div className="w-full max-w-[600px] flex items-center justify-between">
            {/* Left: Player Controls + Time (or Chunk count for PDF) */}
            <div className="flex items-center gap-1.5">
              <button onClick={handleSkipBackward} className="p-1 text-stone-300 hover:text-stone-400 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={handlePlayPause} className="p-1.5 text-stone-300 hover:text-stone-300 transition-colors">
                {isPlaying ? <Pause className="w-4 h-4 fill-stone-300" /> : <Play className="w-4 h-4 fill-stone-300" />}
              </button>
              <button onClick={handleSkipForward} className="p-1 text-stone-300 hover:text-stone-400 transition-colors">
                <RotateCw className="w-4 h-4" />
              </button>
              <div className="ml-2 text-xs text-stone-400 font-medium tabular-nums">
                {isPdfMode 
                    ? `Chunk ${currentChunkIndex + 1} / ${readAloudChunks.length}`
                    : `${formatTime(currentTime)} / ${formatTime(duration)}`
                }
              </div>
            </div>

            {/* Right: Summary, Mode Selector, Auto-scroll, Collapse */}
            <div className="flex items-center gap-1.5">
              {study.summary && (
                <div className="relative">
                  <button
                    onClick={() => setShowSummary(!showSummary)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#dfecc870] text-[#1b5f4a] hover:bg-[#dfecc8] transition-colors text-[10px] font-medium"
                  >
                    <Info className="w-3 h-3" />
                    Summary
                  </button>
                  {showSummary && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSummary(false)} />
                      <div className="absolute top-full left-0 mt-2 w-84 max-h-84 p-3 bg-[#dfecc870] backdrop-blur-sm rounded-xl shadow-sm z-20">
                        <p className="text-xs text-[#1b5f4a] leading-relaxed">{study.summary}</p>
                      </div>
                    </>
                  )}
                </div>
              )}

                <Select
                  value={mode}
                  onValueChange={(value: PracticeMode) => {
                    if (playerRef.current) playerRef.current.pauseVideo();
                    if (isTtsSpeaking) ttsStop();
                    setIsPlaying(false);
                    setMode(value);
                    setCurrentChunkIndex(0);
                    setStopAtTime(null);
                  }}
                >
                  <SelectTrigger className="px-3 py-1.5 h-auto text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-md border-none shadow-none cursor-pointer transition-colors focus:ring-0 focus-visible:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read-aloud" className="data-[state=checked]:bg-[#dfecc8] hover:bg-[#dfecc8]!">Read Aloud</SelectItem>
                    <SelectItem value="shadowing" className="data-[state=checked]:bg-[#dfecc8] hover:bg-[#dfecc8]!">Shadowing</SelectItem>
                    <SelectItem value="listening" className="data-[state=checked]:bg-[#dfecc8] hover:bg-[#dfecc8]!">Listening</SelectItem>
                  </SelectContent>
                </Select>

              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`p-1.5 rounded-sm transition-colors ${autoScroll ? 'bg-[#dfecc870] text-[#1b5f4a]' : 'bg-stone-100 text-stone-400'}`}
              >
                <ListVideo className="w-4 h-4" />
              </button>
              
              {!isPdfMode && (
              <button
                onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                className="p-1.5 text-stone-400 bg-stone-100 rounded-sm hover:text-stone-400"
              >
                {isVideoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              )}
            </div>
          </div>
        </div>

          {/* Desktop Back Button */}
          <Button variant="ghost" onClick={onBack} className="hidden md:flex px-3 py-0 bg-stone-50 hover:bg-stone-100 rounded-md self-start">
            <span className="text-stone-400 text-xs font-medium">Back to library</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent pointer-events-none z-10" />

        <div className="overflow-y-auto scrollbar-hide h-full absolute inset-0">
          {mode === "read-aloud" && (
            <YouTubeReadAloudMode
              chunks={readAloudChunks}
              currentChunkIndex={currentChunkIndex}
              setCurrentChunkIndex={setCurrentChunkIndex}
              isPlaying={isPlaying}
              handlePlayChunk={handlePlayChunk}
              title={study.title}
              activeChunkRef={activeChunkRef}
              autoScroll={autoScroll}
              currentTime={currentTime}
              onDeleteChunk={handleDeleteChunk}
            />
          )}
          {mode === "shadowing" && (
            <YouTubeShadowingMode
              chunks={shadowingChunks}
              currentChunkIndex={currentChunkIndex}
              setCurrentChunkIndex={setCurrentChunkIndex}
              isPlaying={isPlaying}
              handlePlayChunk={handlePlayChunk}
              textId={study.id}
              initialProgress={progressData?.shadowing}
              onProgressChange={onProgressChange}
              activeChunkRef={activeChunkRef}
              autoScroll={autoScroll}
              onDeleteChunk={handleDeleteChunk}
            />
          )}
          {mode === "listening" && (
            <YouTubeListeningMode
              chunks={listeningChunks}
              currentChunkIndex={currentChunkIndex}
              setCurrentChunkIndex={setCurrentChunkIndex}
              isPlaying={isPlaying}
              handlePlayChunk={handlePlayChunk}
              textId={study.id}
              initialProgress={progressData?.listening}
              onProgressChange={onProgressChange}
              activeChunkRef={activeChunkRef}
              autoScroll={autoScroll}
              onDeleteChunk={handleDeleteChunk}
            />
          )}
        </div>
      </div>

      {isOpen && (
        <TextHighlightPopover
          selectedText={selectedText}
          onClose={handleClose}
          onAskAbout={onAskAbout}
        />
      )}
    </div>
  );
}
