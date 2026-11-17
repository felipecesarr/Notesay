"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Waves, GraduationCap, Briefcase, MessageSquareQuote, Zap, BookOpen } from "lucide-react";
import { getAllChatModes, type ChatMode } from "../procedure/chat-modes";

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Waves,
  GraduationCap,
  Briefcase,
  MessageSquareQuote,
  Zap,
  BookOpen,
};

interface ChatModeSelectorProps {
  selectedMode: ChatMode;
  onSelectMode: (mode: ChatMode) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * PRESENTATION LAYER
 * Chat mode selector popover - compact design with Lucide icons
 */
export function ChatModeSelector({
  selectedMode,
  onSelectMode,
  isOpen,
  onClose,
}: ChatModeSelectorProps) {
  const modes = useMemo(() => getAllChatModes(), []);

  const handleSelectMode = (mode: ChatMode) => {
    onSelectMode(mode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute bottom-full left-0 mb-2 z-50 w-64 max-h-80 bg-white/10 backdrop-blur-sm rounded-xl border border-stone-200/50 shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-stone-200/50 bg-white/5">
            <span className="text-xs font-semibold text-stone-700">
              Conversation Mode
            </span>
          </div>

          {/* Mode List - Compact */}
          <div
            className="overflow-y-auto max-h-64 scrollbar-hide p-1.5 space-y-0.5"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {modes.map((mode) => {
              const isSelected = selectedMode === mode.id;
              const IconComponent = ICON_MAP[mode.icon];

              return (
                <button
                  key={mode.id}
                  onClick={() => handleSelectMode(mode.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-md bg-transparent hover:bg-stone-200/40 transition-all text-left"
                >
                  {/* Mode Icon */}
                  {IconComponent && (
                    <div className="shrink-0">
                      <IconComponent className="w-4 h-4 text-stone-600" />
                    </div>
                  )}

                  {/* Mode Info - Compact */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-800">
                      {mode.name}
                    </p>
                    <p className="text-[10px] text-stone-500 line-clamp-1">
                      {mode.description}
                    </p>
                  </div>

                  {/* Checkmark */}
                  {isSelected && (
                    <div className="shrink-0 w-3.5 h-3.5 bg-violet-300 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-violet-800" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
