"use client";

import React, { useState, useRef } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "../procedure";
import { getYouTubeSuggestions } from "../controller";
import { useYouTubeOembed } from "../hooks/useYouTubeOembed";
import { SuggestedVideosPopover } from "./SuggestedVideosPopover";
import Image from "next/image";
import { motion } from "framer-motion";

interface VideoInputProps {
  onExtract: (url: string) => void;
  isProcessing: boolean;
  recentVideos?: { id: string; title: string; thumbnail: string }[];
  onSelectRecent?: (id: string) => void;
}

export function VideoInput({
  onExtract,
  isProcessing,
  recentVideos = [],
  onSelectRecent,
}: VideoInputProps) {
  const [url, setUrl] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // const [detectedVideo, setDetectedVideo] = useState<...> | null>(null); // Removed
  // const [showInvalidError, setShowInvalidError] = useState(false); // Can be derived or simple check
  
  const videoId = extractYouTubeVideoId(url);
  const { data: oEmbedData } = useYouTubeOembed(videoId);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived state for display
  const showInvalidError = url.length > 3 && !videoId;
  
  // Construct detected object for display if ID exists
  const detectedDisplay = videoId ? {
      id: videoId,
      thumbnail: getYouTubeThumbnail(videoId),
      title: oEmbedData?.title || "Loading title...",
      author: oEmbedData?.author_name || "YouTube",
  } : null;

  // Removed useEffect fetch logic

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const videoId = extractYouTubeVideoId(url);
    if (url && !isProcessing && videoId) {
      onExtract(url);
    }
  };

  const handleSelectSuggestion = async (topic: string) => {
    setLoadingSuggestions(true);

    try {
      // Fetch videos for the selected topic
      const result = await getYouTubeSuggestions(topic);

      if (
        result.success &&
        result.suggestions &&
        result.suggestions.length > 0
      ) {
        // Pick a random video from suggestions based on the topic
        const randomVideo =
          result.suggestions[
            Math.floor(Math.random() * result.suggestions.length)
          ];
        setUrl(randomVideo.url);
      } else {
        void 0;
      }
    } catch (error) {
      console.error("Error fetching video:");
    }

    setLoadingSuggestions(false);
  };

  return (
    <div data-tour="youtube-input" className="flex flex-col items-center justify-center h-full w-full px-6">
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-16"
      >
        <Image
          src="/logos/notelab-input.png"
          alt="Notesay Logo"
          width={80}
          height={80}
          className="-rotate-12"
        />
      </motion.div>

      <div className="relative w-full max-w-lg">
        {/* Gradient glow background */}
        <div className="absolute inset-0 bg-linear-to-t from-violet-200 to-[#dfecc8] blur-md opacity-150 rounded-4xl" />
        
        {/* Main Input Card */}
        <div className="relative w-full bg-white border border-stone-50 rounded-4xl p-4">
          <form onSubmit={handleSubmit} className="flex flex-col min-h-[120px]">
            {/* Content Area */}
            <div className="flex-1 mb-4 flex flex-col gap-3">
                {/* Detected Video Chip - Enhanced */}
              {detectedDisplay ? (
                <div className="flex items-center gap-3 bg-stone-100 rounded-xl p-0 w-fit max-w-60 h-auto animate-in fade-in slide-in-from-bottom-2 relative group pr-10">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-12 shrink-0 rounded-lg my-2 ml-2 overflow-hidden bg-stone-100">
                    <Image
                      src={detectedDisplay.thumbnail}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col min-w-[120px]">
                    <span className="text-xs font-semibold text-stone-800 truncate max-w-[200px] leading-tight mb-0.5">
                      {detectedDisplay.title}
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight">
                      {detectedDisplay.author}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUrl("");
                      // setDetectedVideo(null); // No local state to clear
                    }}
                    className="p-1 absolute right-0 top-0 text-stone-100 bg-stone-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                /* Input Field - Only shown when no video detected */
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube URL..."
                    className={`w-full text-sm placeholder:text-stone-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent m-2 p-0 ${
                      showInvalidError ? "text-red-500" : "text-stone-600"
                    }`}
                    disabled={isProcessing}
                    autoFocus
                  />
                  {showInvalidError && (
                    <span className="text-xs text-red-500 ml-2 animate-in fade-in slide-in-from-top-1">
                      Please enter a valid YouTube URL
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center gap-2">
                <SuggestedVideosPopover
                  onSelectTopic={handleSelectSuggestion}
                  isLoading={loadingSuggestions}
                >
                  <button
                    type="button"
                    disabled={loadingSuggestions}
                    className="flex items-center gap-2 p-3 rounded-full text-stone-500 text-xs font-medium bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
                  >
                    {loadingSuggestions ? (
                      <div className="w-3.5 h-3.5 border-2 border-stone-400/30 border-t-stone-400 rounded-full animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </button>
                </SuggestedVideosPopover>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!url || isProcessing || showInvalidError}
                  onClick={handleSubmit}
                  className={`
                  flex items-center justify-center gap-2 px-3 py-3 rounded-full text-sm font-medium transition-all
                  ${
                    url && !showInvalidError
                      ? "bg-[#1b5f4a] text-[#dfecc8]"
                      : "bg-[#dfecc870] text-[#1b5f4a] cursor-not-allowed"
                  }
                `}
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Studies (Pills below) */}
      {recentVideos.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {recentVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => onSelectRecent?.(video.id)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200"
            >
              <div className="w-3.5 h-3.5 shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-red-600 fill-current"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <span className="truncate max-w-[150px]">{video.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
