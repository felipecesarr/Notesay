
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, ChevronLeft, Volume2, Shuffle, Trash2 } from "lucide-react";
import { deleteFlashcard, createFlashcard } from "@/features/flashcards/controller";
import { useFlashcards } from "../hooks/useFlashcards";
import { Flashcard } from "@/features/flashcards/controller/types";
import { Button } from "@/core/components/ui/button";
import { FlashcardsEmptyState } from "./FlashcardsEmptyState";
import { FlashcardsHeader } from "./FlashcardsHeader";
import { CreateFlashcardModal } from "./CreateFlashcardModal";
import { useTTS } from "@/features/ai-interaction/presentation/hooks/useTTS";
import { cn } from "@/lib/utils";

export function FlashcardsTab() {
  const { flashcards: fetchedFlashcards, isLoading, refetchFlashcards } = useFlashcards();
  const [displayFlashcards, setDisplayFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isSpeaking, speak } = useTTS();

  // Sync hook data to local display state (for shuffle ability)
  // Sync hook data to local display state (for shuffle ability)
  useEffect(() => {
    if (fetchedFlashcards) {
        setTimeout(() => setDisplayFlashcards(fetchedFlashcards), 0);
    }
  }, [fetchedFlashcards]);

  const handleCreateFlashcard = async (
    front: string,
    back: string,
    context?: string,
    tense?: string,
    phonetic?: string
  ) => {
    const result = await createFlashcard(front, back, context, tense, phonetic);

    if (result.success && result.flashcard) {
      // Real-time update: Add to local state immediately
      setDisplayFlashcards(prev => [...prev, result.flashcard!]);

      // Also trigger background refetch to ensure consistency
      refetchFlashcards();

      // Navigate to the new card (last one)
      setCurrentIndex(displayFlashcards.length); // length of OLD array is index of new item
      setIsFlipped(false);
    } else {
      throw new Error(result.error || "Failed to create flashcard");
    }
  };

  const handleSelectFlashcard = (card: Flashcard) => {
    const index = displayFlashcards.findIndex(c => c.id === card.id);
    if (index !== -1) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speak(text);
  };

  const handleNext = () => {
    if (currentIndex < displayFlashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(0), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...displayFlashcards].sort(() => Math.random() - 0.5);
    setDisplayFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleDelete = async () => {
    const currentCard = displayFlashcards[currentIndex];
    if (!currentCard) return;

    setIsDeleting(true);
    const success = await deleteFlashcard(currentCard.id); // Assuming simple object return or we need checking result
    
    // The controller returns { success: boolean } based on my previous check of controller code
    if (success && typeof success === 'object' && 'success' in success && success.success) {
      await refetchFlashcards();
      
      const newFlashcards = displayFlashcards.filter(c => c.id !== currentCard.id);
      setDisplayFlashcards(newFlashcards);
      
      if (currentIndex >= newFlashcards.length) {
        setCurrentIndex(Math.max(0, newFlashcards.length - 1));
      }
      setIsFlipped(false);
    }
    setIsDeleting(false);
  };


  if (isLoading) {
    return (
      <div className="flex flex-col h-full relative">
        <FlashcardsHeader
          flashcards={fetchedFlashcards}
          onSelectFlashcard={handleSelectFlashcard}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-stone-300" />
        </div>
        <CreateFlashcardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateFlashcard={handleCreateFlashcard}
        />
      </div>
    );
  }

  if (displayFlashcards.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-full relative">
        <FlashcardsHeader
          flashcards={fetchedFlashcards}
          onSelectFlashcard={handleSelectFlashcard}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
        <div className="flex-1">
          <FlashcardsEmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
        </div>
        <CreateFlashcardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateFlashcard={handleCreateFlashcard}
        />
      </div>
    );
  }

  const currentCard = displayFlashcards[currentIndex];

  return (
    <div data-tour="flashcards-tab" className="flex flex-col h-full bg-stone-50/30 relative overflow-hidden">
      {/* Header */}
      <FlashcardsHeader
        flashcards={displayFlashcards}
        onSelectFlashcard={handleSelectFlashcard}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />
      {/* Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000 min-h-0">
        <div 
          className="w-full max-w-[480px] aspect-[1.5/1] relative cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative preserve-3d"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* FRONT */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center p-8 text-center hover:shadow-md transition-shadow duration-300">
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => handleSpeak(e, currentCard.front)}
                  className={cn(
                    "p-2 rounded-full transition-all duration-200",
                    isSpeaking 
                      ? "bg-[#deefb850] text-[#1b5f4a]" 
                      : "text-stone-300 hover:text-[#1b5f4a] hover:bg-[#defcc830]"
                  )}
                  title={isSpeaking ? "Stop" : "Listen"}
                >
                  {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
                <h2 className="text-3xl font-semibold text-stone-800 leading-tight">
                  {currentCard.front}
                </h2>
              </div>
            </div>

            {/* BACK */}
            <div 
              className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center p-8 text-center"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full">
                <p className="text-sm text-stone-700 leading-relaxed font-medium">
                  {currentCard.back}
                </p>
                {currentCard.context && (
                  <div className="mt-2 pt-3 border-t border-stone-100 w-full">
                    <p className="text-xs text-stone-500 italic leading-relaxed line-clamp-3">
                      &quot;{currentCard.context}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Control Bar (Bottom) */}
      <div className="p-6 flex justify-center shrink-0">
        <div className="bg-stone-100 rounded-lg p-1.5 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShuffle}
            className="h-8 w-8 rounded-lg text-stone-500 hover:bg-transparent"
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <div className="w-px h-4 bg-stone-300 mx-1" />

          <div className="flex items-center gap-2 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="h-6 w-6 rounded-lg text-stone-500 hover:bg-transparent disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-xs font-medium text-stone-500 tabular-nums min-w-12 text-center">
              {currentIndex + 1} of {displayFlashcards.length}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === displayFlashcards.length - 1}
              className="h-6 w-6 rounded-lg text-stone-500 hover:bg-transparent disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-4 bg-stone-300 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 rounded-lg text-stone-400 hover:bg-transparent hover:text-red-500 disabled:opacity-50"
            title="Delete Card"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Create Flashcard Modal */}
      <CreateFlashcardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateFlashcard={handleCreateFlashcard}
      />
    </div>
  );
}
