import React, { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Flashcard } from "@/features/flashcards/controller/types";

interface FlashcardsHeaderProps {
  flashcards: Flashcard[];
  onSelectFlashcard?: (flashcard: Flashcard) => void;
  onOpenCreateModal?: () => void;
}

export const FlashcardsHeader = React.memo(function FlashcardsHeader({
  flashcards,
  onSelectFlashcard,
  onOpenCreateModal,
}: FlashcardsHeaderProps) {
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  return (
    <div className="px-6 pt-4 pb-2 flex items-center justify-between shrink-0 bg-white/10 backdrop-blur-sm relative z-10">
      {/* All Flashcards Dropdown - Left */}
      <div className="relative z-10000">
        <button
          onClick={() => setIsFlashcardsOpen(!isFlashcardsOpen)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-700 hover:text-stone-900 hover:bg-stone-200/30 rounded-sm transition-colors"
        >
          <span className="font-medium">
            Flashcards ({flashcards.length})
          </span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Flashcards List Popover */}
        <AnimatePresence>
          {isFlashcardsOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-9998"
                onClick={() => setIsFlashcardsOpen(false)}
              />

              {/* Popover */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 z-9999 w-80 max-h-96 bg-white rounded-lg border border-stone-200 shadow-lg overflow-hidden"
              >
                <div className="p-3 border-b border-stone-100 bg-[#dfecc830]">
                  <h3 className="text-xs font-semibold text-stone-700">
                    All Flashcards
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Click any card to jump to it
                  </p>
                </div>
                <div className="overflow-y-auto max-h-80 scrollbar-hide">
                  {flashcards.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-xs text-stone-500">
                        No flashcards yet
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Add your first card to get started
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {flashcards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => {
                            onSelectFlashcard?.(card);
                            setIsFlashcardsOpen(false);
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-[#dfecc830] transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-stone-800 font-semibold line-clamp-1">
                                {card.front}
                              </p>
                              <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                                {card.back}
                              </p>
                              {card.context && (
                                <p className="text-[10px] text-stone-400 mt-1.5 italic line-clamp-1">
                                  &quot;{card.context}&quot;
                                </p>
                              )}
                            </div>
                            <span className="text-[9px] text-stone-400 shrink-0">
                              {new Date(card.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Add Flashcard Button - Right */}
      <button
        onClick={onOpenCreateModal}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1b5f4a] hover:bg-[#164a3a] text-white rounded-lg text-xs font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Card
      </button>
    </div>
  );
});
