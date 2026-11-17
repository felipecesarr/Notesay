"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Folder, RefreshCw, ChevronRight, ChevronDown, FileText } from "lucide-react";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  type: "youtube" | "text" | "pdf";
  videoId?: string;
  thumbnail?: string;
}

interface VideoSelectionPopoverProps {
  videos: Video[];
  selectedVideoIds: string[];
  onToggleVideo: (videoId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function VideoSelectionPopover({
  videos,
  selectedVideoIds,
  onToggleVideo,
  isOpen,
  onClose,
  onRefresh,
  isRefreshing = false,
}: VideoSelectionPopoverProps) {
  // State for collapsed sections (default: both collapsed)
  const [isYouTubeExpanded, setIsYouTubeExpanded] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [isPdfExpanded, setIsPdfExpanded] = useState(false);

  // Group videos by type
  const groupedVideos = useMemo(() => {
    const youtube = videos.filter(v => v.type === "youtube");
    const text = videos.filter(v => v.type === "text");
    const pdf = videos.filter(v => v.type === "pdf");
    return { youtube, text, pdf };
  }, [videos]);

  // Determine which type is currently selected (if any)
  const selectedType = useMemo(() => {
    if (selectedVideoIds.length === 0) return null;
    const firstSelected = videos.find(v => selectedVideoIds.includes(v.id));
    return firstSelected?.type || null;
  }, [selectedVideoIds, videos]);

  // Handle video toggle with type restriction
  const handleToggle = (videoId: string, videoType: "youtube" | "text" | "pdf") => {
    // If no selection yet, allow any type
    if (selectedVideoIds.length === 0) {
      onToggleVideo(videoId);
      return;
    }

    // If trying to select different type, ignore
    if (selectedType && videoType !== selectedType) {
      return;
    }

    // Otherwise, toggle normally
    onToggleVideo(videoId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popover */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute bottom-full left-0 mb-2 z-50 w-72 max-h-80 bg-white/10 backdrop-blur-sm rounded-xl border border-stone-200/50 shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Refresh Button */}
          {onRefresh && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-stone-200/50 bg-white/5">
              <span className="text-xs font-semibold text-stone-700">Sources</span>
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-md hover:bg-stone-200/40 transition-colors disabled:opacity-50"
                title="Refresh sources"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {/* Video List */}
          <div className="overflow-y-auto max-h-64 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-stone-300 mb-3"
                >
                  <path
                    fill="currentColor"
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                <p className="text-xs text-stone-400 text-center">
                  No sources available
                </p>
                <p className="text-[10px] text-stone-400 text-center mt-1">
                  Add YouTube videos or AI-generated texts first
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-3">
                {/* YouTube Section */}
                {groupedVideos.youtube.length > 0 && (
                  <div>
                    {/* Header - Clickable to toggle */}
                    <button
                      onClick={() => setIsYouTubeExpanded(!isYouTubeExpanded)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-stone-100/50 rounded-md transition-colors"
                    >
                      {/* Arrow Icon */}
                      {isYouTubeExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                      )}
                      <Folder className="w-3.5 h-3.5 text-stone-600" />
                      <span className="text-[10px] font-semibold text-stone-700">YouTube</span>
                      <div className="flex-1 h-px bg-stone-300/50" />
                      <span className="text-[9px] text-stone-500 font-medium">{groupedVideos.youtube.length}</span>
                    </button>

                    {/* Videos - Collapsible */}
                    <AnimatePresence>
                      {isYouTubeExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 pt-1">
                            {groupedVideos.youtube.map((video) => {
                              const isSelected = selectedVideoIds.includes(video.id);
                              const isDisabled = !!(selectedType && selectedType !== "youtube");
                              return (
                                <button
                                  key={video.id}
                                  onClick={() => handleToggle(video.id, "youtube")}
                                  disabled={isDisabled}
                                  className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all ${
                                    isDisabled
                                      ? "opacity-40 cursor-not-allowed"
                                      : "bg-transparent hover:bg-stone-200/40"
                                  }`}
                                >
                                  {/* Source Icon */}
                                  <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-6 h-6 text-red-600"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                                      />
                                    </svg>
                                  </div>

                                  {/* Source Title */}
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="text-[10px] font-medium text-stone-700 truncate">
                                      {video.title}
                                    </p>
                                  </div>

                                  {/* Checkmark */}
                                  {isSelected && (
                                    <div className="shrink-0 w-3.5 h-3.5 p-0.5 bg-[#1b5f4a] rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-[#defcc8]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Text Section */}
                {groupedVideos.text.length > 0 && (
                  <div>
                    {/* Header - Clickable to toggle */}
                    <button
                      onClick={() => setIsTextExpanded(!isTextExpanded)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-stone-100/50 rounded-md transition-colors"
                    >
                      {/* Arrow Icon */}
                      {isTextExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                      )}
                      <Folder className="w-3.5 h-3.5 text-stone-600" />
                      <span className="text-[10px] font-semibold text-stone-700">Text</span>
                      <div className="flex-1 h-px bg-stone-300/50" />
                      <span className="text-[9px] text-stone-500 font-medium">{groupedVideos.text.length}</span>
                    </button>

                    {/* Videos - Collapsible */}
                    <AnimatePresence>
                      {isTextExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 pt-1">
                            {groupedVideos.text.map((video) => {
                              const isSelected = selectedVideoIds.includes(video.id);
                              const isDisabled = !!(selectedType && selectedType !== "text");
                              return (
                                <button
                                  key={video.id}
                                  onClick={() => handleToggle(video.id, "text")}
                                  disabled={isDisabled}
                                  className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all ${
                                    isDisabled
                                      ? "opacity-60 cursor-not-allowed"
                                      : "bg-transparent hover:bg-stone-200/40"
                                  }`}
                                >
                                  {/* Source Icon */}
                                  <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                                    <Image
                                      src="/logos/notelab-main.png"
                                      alt="AI Text"
                                      width={20}
                                      height={20}
                                    />
                                  </div>

                                  {/* Source Title */}
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="text-[10px] font-medium text-stone-700 truncate">
                                      {video.title}
                                    </p>
                                  </div>

                                  {/* Checkmark */}
                                  {isSelected && (
                                    <div className="shrink-0 w-3.5 h-3.5 p-0.5 bg-violet-300 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-violet-800" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* PDF Section */}
                {groupedVideos.pdf.length > 0 && (
                  <div>
                    {/* Header */}
                    <button
                      onClick={() => setIsPdfExpanded(!isPdfExpanded)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-stone-100/50 rounded-md transition-colors"
                    >
                      {isPdfExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                      )}
                      <FileText className="w-3.5 h-3.5 text-stone-600" />
                      <span className="text-[10px] font-semibold text-stone-700">PDFs</span>
                      <div className="flex-1 h-px bg-stone-300/50" />
                      <span className="text-[9px] text-stone-500 font-medium">{groupedVideos.pdf.length}</span>
                    </button>

                    {/* PDFs - Collapsible */}
                    <AnimatePresence>
                      {isPdfExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 pt-1">
                            {groupedVideos.pdf.map((video) => {
                              const isSelected = selectedVideoIds.includes(video.id);
                              const isDisabled = !!(selectedType && selectedType !== "pdf");
                              return (
                                <button
                                  key={video.id}
                                  onClick={() => handleToggle(video.id, "pdf")}
                                  disabled={isDisabled}
                                  className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all ${
                                    isDisabled
                                      ? "opacity-60 cursor-not-allowed"
                                      : "bg-transparent hover:bg-stone-200/40"
                                  }`}
                                >
                                  {/* Source Icon */}
                                  <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-[#1b5f4a]" />
                                  </div>

                                  {/* Source Title */}
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="text-[10px] font-medium text-stone-700 truncate">
                                      {video.title}
                                    </p>
                                  </div>

                                  {/* Checkmark */}
                                  {isSelected && (
                                    <div className="shrink-0 w-3.5 h-3.5 p-0.5 bg-[#1b5f4a] rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-[#dfecc8]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
