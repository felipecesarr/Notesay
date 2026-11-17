"use client";

import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { AtSign, ArrowRight, X, Lightbulb, AudioLines, Waves, GraduationCap, Briefcase, MessageSquareQuote, Zap, BookOpen, FileText } from "lucide-react";
import { VideoSelectionPopover } from "./VideoSelectionPopover";
import { ChatModeSelector } from "./ChatModeSelector";
import { getChatModeConfig, type ChatMode } from "../procedure/chat-modes";
import { useVoiceInput } from "@/core/hooks/use-voice-input";
import { useSources } from "@/features/chat/hooks/useSources";
import Image from "next/image";
import { motion } from "framer-motion";

// Map icon names to Lucide components
const MODE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Waves,
  GraduationCap,
  Briefcase,
  MessageSquareQuote,
  Zap,
  BookOpen,
};


interface ChatInputProps {
  onSendMessage: (message: string, selectedVideoIds?: string[], isQuizMode?: boolean, chatMode?: ChatMode) => void;
  isProcessing: boolean;
  placeholder?: string;
  initialValue?: string;
}

export function ChatInput({
  onSendMessage,
  isProcessing,
  placeholder = "Ask anything...",
  initialValue = "",
}: ChatInputProps) {
  // Use sources hook for real-time updates
  const { sources: availableVideos, isLoading: isLoadingSources, refreshSources } = useSources();
  const [message, setMessage] = useState(initialValue);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-selected-sources');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isQuizMode, setIsQuizMode] = useState(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-quiz-mode');
      return saved === 'true';
    }
    return false;
  });
  const [chatMode, setChatMode] = useState<ChatMode>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-mode');
      return (saved as ChatMode) || 'chill';
    }
    return 'chill';
  });
  const [isVideoPopoverOpen, setIsVideoPopoverOpen] = useState(false);
  const [isModePopoverOpen, setIsModePopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const atButtonRef = useRef<HTMLButtonElement>(null);
  const modeButtonRef = useRef<HTMLButtonElement>(null);

  const [showQuizTooltip, setShowQuizTooltip] = useState(false);

  // Voice input hook
  const {
    isRecording,
    transcript: voiceTranscript,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceInput();

  // Persist selectedVideoIds to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-selected-sources', JSON.stringify(selectedVideoIds));
    }
  }, [selectedVideoIds]);

  // Persist isQuizMode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-quiz-mode', String(isQuizMode));
    }
  }, [isQuizMode]);

  // Persist chatMode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-mode', chatMode);
    }
  }, [chatMode]);

  // Handle mic button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
      // Copy voice transcript to message when stopping
      if (voiceTranscript) {
        setMessage(voiceTranscript);

        // Auto-resize textarea
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          }
        }, 0);
      }
    } else {
      startRecording();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = message.trim();
    if (trimmed && !isProcessing) {
      onSendMessage(
        trimmed,
        selectedVideoIds.length > 0 ? selectedVideoIds : undefined,
        isQuizMode,
        chatMode
      );
      setMessage("");
      // DON'T clear selectedVideoIds, isQuizMode, or chatMode - persist across messages
      clearTranscript();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleToggleVideo = (videoId: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleRemoveVideo = (videoId: string) => {
    setSelectedVideoIds((prev) => prev.filter((id) => id !== videoId));
  };

  const selectedVideos = availableVideos.filter((v) =>
    selectedVideoIds.includes(v.id)
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRecording) {
      setMessage(e.target.value);

      // Auto-resize textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, 0);
    }
  };

  // Determine the current value to display (voice or typed)
  const displayValue = isRecording ? voiceTranscript : message;

  return (
    <div className="w-full bg-transparent p-0 px-0 pb-4 flex flex-col gap-2 relative">
      {/* Fade Gradient */}
      <div className="absolute -top-16 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent pointer-events-none z-10" />

      {/* Selected Videos Pills - Outside the form */}
      {selectedVideos.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 px-4">
          {selectedVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-2 px-3 py-0 h-8 w-36 bg-stone-100 rounded-md shrink-0 group"
            >
              {/* Source Icon */}
              {video.type === "youtube" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 text-red-600 shrink-0"
                >
                  <path
                    fill="currentColor"
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
              ) : video.type === "pdf" ? (
                <FileText className="w-3.5 h-3.5 text-[#1b5f4a] shrink-0" />
              ) : (
                <Image
                  src="/logos/notelab-main.png"
                  alt="AI Text"
                  width={16}
                  height={16}
                />
              )}

              {/* Source Title */}
              <span className="text-[10px] font-medium text-stone-700 max-w-[150px] truncate">
                {video.title}
              </span>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveVideo(video.id)}
                className="p-0.5 rounded-full hover:bg-stone-200 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-2 h-2 text-stone-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat Input Form */}
      <form data-tour="chat-input" onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl mx-4 p-3 shadow-sm hover:shadow-md transition-shadow relative">
        {/* Input Area */}
        <div className="flex flex-col min-h-20">
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : placeholder}
            disabled={isProcessing || isRecording}
            rows={1}
            style={{ minHeight: '40px' }}
            className="w-full resize-none bg-transparent p-2 border-none outline-none text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-0 mb-2 max-h-32 overflow-y-auto"
            autoFocus
          />

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 relative">
              {/* @ button to select videos */}
              <button
                ref={atButtonRef}
                type="button"
                onClick={() => setIsVideoPopoverOpen(!isVideoPopoverOpen)}
                className="flex items-center gap-1.5 p-2 rounded-full text-xs font-medium bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-colors"
              >
                <AtSign className="w-3.5 h-3.5" />
              </button>

              {/* Video Selection Popover */}
              <VideoSelectionPopover
                videos={availableVideos}
                selectedVideoIds={selectedVideoIds}
                onToggleVideo={handleToggleVideo}
                isOpen={isVideoPopoverOpen}
                onClose={() => setIsVideoPopoverOpen(false)}
                onRefresh={refreshSources}
                isRefreshing={isLoadingSources}
              />

              {/* Quiz Mode Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsQuizMode(!isQuizMode)}
                  onMouseEnter={() => setShowQuizTooltip(true)}
                  onMouseLeave={() => setShowQuizTooltip(false)}
                  className={`flex items-center gap-1.5 p-2 rounded-full text-xs hover:bg-violet-100 hover:text-violet-800 font-medium transition-colors ${
                    isQuizMode
                      ? "bg-violet-100 text-violet-800 hover:bg-violet-200"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                </button>

                {/* Tooltip */}
                {showQuizTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-violet-300/50 backdrop-blur-sm text-white text-[10px] rounded-lg shadow-sm pointer-events-none z-30 min-w-40"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-violet-800">Quiz Mode</span>
                      <span className="text-violet-800 leading-relaxed">AI will quiz you on selected sources</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-4 -mt-px">
                      <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-violet-300/50" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Mode Selector Button */}
              <button
                ref={modeButtonRef}
                data-tour="chat-modes"
                type="button"
                onClick={() => setIsModePopoverOpen(!isModePopoverOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium bg-[#dfecc870] text-[#1b5f4a] hover:bg-[#dfecc8] transition-colors"
              >
                {(() => {
                  const ModeIcon = MODE_ICON_MAP[getChatModeConfig(chatMode).icon];
                  return ModeIcon ? (
                    <div className="p-1 rounded-full bg-[#1b5f4a]">
                      <ModeIcon className="w-2.5 h-2.5 text-[#dfecc8]" />
                    </div>
                  ) : null;
                })()}
                <span className="font-semibold">{getChatModeConfig(chatMode).name}</span>
              </button>

              {/* Chat Mode Selection Popover */}
              <ChatModeSelector
                selectedMode={chatMode}
                onSelectMode={setChatMode}
                isOpen={isModePopoverOpen}
                onClose={() => setIsModePopoverOpen(false)}
                anchorRef={modeButtonRef}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Mic button */}
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-2 rounded-full transition-colors ${
                  isRecording
                    ? "bg-violet-100 text-[#1b5f4a] hover:bg-[#dfecc8] animate-pulse"
                    : "text-stone-400 bg-stone-100 hover:text-stone-600 hover:bg-stone-200"
                }`}
              >
                <AudioLines className="w-4 h-4" />
              </button>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!message.trim() || isProcessing}
                onClick={handleSubmit}
                className={`
                  flex items-center justify-center gap-2 p-2 rounded-full text-sm font-medium transition-all
                  ${
                    message.trim() && !isProcessing
                      ? "bg-[#1b5f4a] text-[#dfecc8] hover:bg-[#1b5f4a]"
                      : "bg-[#dfecc870] text-[#1b5f4a] cursor-not-allowed"
                  }
                `}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
