"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  type: "youtube" | "text";
  videoId?: string;
  thumbnail?: string;
}

interface VideoSelectionPopoverProps {
  videos: Video[];
  selectedVideoIds: string[];
  onToggleVideo: (videoId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}

export function VideoSelectionPopover({
  videos,
  selectedVideoIds,
  onToggleVideo,
  isOpen,
  onClose,
}: VideoSelectionPopoverProps) {
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
          {/* Video List */}
          <div className="overflow-y-auto max-h-80 scrollbar-hide">
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
              <div className="p-2 space-y-1">
                {videos.map((video) => {
                  const isSelected = selectedVideoIds.includes(video.id);
                  return (
                    <button
                      key={video.id}
                      onClick={() => onToggleVideo(video.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-md bg-transparent hover:bg-stone-200/40 transition-all">
                      {/* Source Icon */}
                      <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                        {video.type === "youtube" ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-red-600"
                          >
                            <path
                              fill="currentColor"
                              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                            />
                          </svg>
                        ) : (
                          <Image
                            src="/logos/notelab-main.png"
                            alt="AI Text"
                            width={20}
                            height={20}
                          />
                        )}
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
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
