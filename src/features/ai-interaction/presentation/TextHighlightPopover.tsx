"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useDragControls, motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Volume2, Loader2, Check, FileText, BookOpen, Layers, Lightbulb, Sparkles, MessageCircle, Repeat, ArrowRightLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverAnchor } from "@/core/components/ui/popover";
import { Sheet, SheetContent } from "@/core/components/ui/sheet";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { saveFlashcard } from "@/features/flashcards/controller";
import { useTextSelection } from "@/core/hooks/use-text-selection";
import { useMobileDetection } from "@/core/hooks/use-mobile-detection";
import { useUIStore } from "@/core/store/ui-store";
import { WordData } from "@/features/ai-interaction/types";
import { useWordAnalysis } from "./hooks/useWordAnalysis";
import { useTTS } from "./hooks/useTTS";
import { HighlightToolbar } from "./components/HighlightToolbar";
import { HighlightExpandedView, Tab } from "./components/HighlightExpandedView";
import { cn } from "@/lib/utils";

interface TextHighlightPopoverProps {
  selectedText: string;
  onClose: () => void;
  onAskAbout?: (text: string) => void;
  onSaveNote?: (text: string) => Promise<{ success: boolean; error?: string }>;
}

export function TextHighlightPopover({
  selectedText,
  onClose,
  onAskAbout,
  onSaveNote,
}: TextHighlightPopoverProps) {
  // Mobile detection - with mounted state to prevent hydration mismatch
  const isMobile = useMobileDetection();
  const setMobileActiveTab = useUIStore((state) => state.setMobileActiveTab);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- State & History ---
  const [currentText, setCurrentText] = useState(selectedText);
  const [history, setHistory] = useState<{ text: string; data: WordData | null }[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("meaning");
  const [isExpanded, setIsExpanded] = useState(false);

  // UI Feedback State
  const [isSaved, setIsSaved] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // --- Hooks ---
  const queryClient = useQueryClient();
  const { data: wordData, isLoading } = useWordAnalysis(currentText);
  const { isSpeaking, speak, stop } = useTTS();
  const dragControls = useDragControls();

  // --- Positioning & Selection (Desktop only) ---
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const initialRangeRef = useRef<Range | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Enable text selection within this popover for nested lookups
  const {
    selectedText: nestedSelectedText,
    handleClose: handleNestedClose
  } = useTextSelection(contentRef);

  // Position Logic (Desktop)
  const updatePosition = useCallback(() => {
    if (initialRangeRef.current) {
      const rect = initialRangeRef.current.getBoundingClientRect();
      setAnchorRect(rect);
    }
  }, []);

  useLayoutEffect(() => {
    if (isMobile) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      initialRangeRef.current = selection.getRangeAt(0).cloneRange();
      updatePosition();
    }
  }, [updatePosition, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition, isMobile]);

  // --- Handlers ---

  // Handle nested selection - navigate to new word
  useEffect(() => {
    if (nestedSelectedText && nestedSelectedText !== currentText) {
      const timer = setTimeout(() => {
        setHistory(prev => [...prev, { text: currentText, data: wordData || null }]);
        setCurrentText(nestedSelectedText);
        setIsSaved(false);
        setIsNoteSaved(false);
        stop();
        handleNestedClose();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [nestedSelectedText, currentText, wordData, handleNestedClose, stop]);

  const handleBack = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentText(previous.text);
  };

  const handleTTS = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(currentText);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!wordData) return;

    try {
      const result = await saveFlashcard({
        front: currentText,
        back: wordData.meaning,
        context: wordData.usage,
        tense: wordData.tense,
        phonetic: wordData.phonetic,
      });

      if (result.success) {
        setIsSaved(true);
        setIsDuplicate(false);
        // Invalidate cache to update FlashcardsTab immediately
        queryClient.invalidateQueries({ queryKey: ["flashcards"] });
        setTimeout(() => setIsSaved(false), 2000);
      } else if (result.error?.includes("already exists")) {
        setIsDuplicate(true);
        setIsSaved(true);
        setTimeout(() => {
          setIsSaved(false);
          setIsDuplicate(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving flashcard:");
    }
  };

  const handleAskAbout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAskAbout && currentText) {
      onAskAbout(`Can you explain "${currentText}" in more detail?`);
      if (isMobile) {
        setMobileActiveTab("chat");
      }
      onClose();
    }
  };

  const handleSaveNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSaveNote || !currentText) return;

    try {
      const result = await onSaveNote(currentText);
      if (result.success) {
        setIsNoteSaved(true);
        setTimeout(() => setIsNoteSaved(false), 2000);
      } else {
        console.error("Failed to save note:");
      }
    } catch (error) {
      console.error("Error saving note:");
    }
  };

  // ========================================
  // MOBILE: Bottom Sheet
  // Only render after mount to prevent hydration mismatch
  // ========================================
  if (mounted && isMobile) {
    return (
      <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[85vh] flex flex-col p-0 [&>button]:hidden"
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pb-4 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {/* Back Button */}
                {history.length > 0 && (
                  <button
                    onClick={handleBack}
                    className="mt-1 p-1 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-stone-800 capitalize tracking-tight font-serif break-words">
                      {isLoading ? "Analyzing..." : wordData?.word || currentText}
                    </h3>
                    {wordData?.tense && wordData.tense !== "N/A" && (
                      <Badge variant="secondary" className="bg-[#1b5f4a] text-[#dfecc8] hover:bg-[#1b5f4a] text-[10px] uppercase tracking-wider border-none shrink-0">
                        {wordData.tense}
                      </Badge>
                    )}
                  </div>
                  {wordData?.phonetic && (
                    <p className="text-xs text-stone-400 mt-0.5">{wordData.phonetic}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full transition-all",
                    isSpeaking
                      ? "bg-violet-200 text-violet-700"
                      : "bg-violet-50 text-violet-600"
                  )}
                  onClick={handleTTS}
                >
                  {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full transition-all",
                    isNoteSaved ? "bg-[#dfecc8] text-[#1b5f4a]" : "bg-stone-100 text-stone-600"
                  )}
                  onClick={handleSaveNote}
                >
                  {isNoteSaved ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 pb-3 shrink-0">
            <div className="flex p-1 bg-stone-100 rounded-xl gap-1">
              {[
                { id: "meaning", icon: BookOpen, label: "Meaning" },
                { id: "thesaurus", icon: ArrowRightLeft, label: "Thesaurus" },
                { id: "usage", icon: Layers, label: "Usage" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-white text-stone-700 shadow-sm"
                      : "text-stone-500"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div ref={contentRef} className="flex-1 overflow-y-auto px-5 min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-[#1b5f4a] border-t-[#dfecc8] rounded-full animate-spin" />
                <p className="text-xs text-[#1b5f4a] font-medium uppercase tracking-wider">Analyzing...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "meaning" && (
                  <motion.div
                    key="meaning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pb-4"
                  >
                    <p className="text-stone-900 text-sm leading-relaxed font-medium">
                      {wordData?.meaning}
                    </p>

                    {wordData?.interviewTip && (
                      <div className="bg-[#dfecc870] rounded-xl p-4 flex gap-3">
                        <div className="p-2 bg-[#dfecc8] rounded-lg h-fit text-[#1b5f4a] shrink-0">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1b5f4a] uppercase tracking-wider mb-1">Smart Tip</h4>
                          <p className="text-xs text-[#1b5f4a] leading-relaxed">
                            {wordData.interviewTip}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "thesaurus" && (
                  <motion.div
                    key="thesaurus"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5 pb-4"
                  >
                    {wordData?.synonyms && wordData.synonyms.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1b5f4a]" />
                          Similar Words
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {wordData.synonyms.map((syn, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[#dfecc870] text-[#1b5f4a] text-xs font-medium rounded-lg">
                              {syn}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-stone-400 text-sm italic text-center py-8">No synonyms found.</p>
                    )}

                    {wordData?.antonyms && wordData.antonyms.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                          Opposite Words
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {wordData.antonyms.map((ant, i) => (
                            <span key={i} className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-medium rounded-lg">
                              {ant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "usage" && (
                  <motion.div
                    key="usage"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="pb-4"
                  >
                    <div className="bg-stone-100 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Lightbulb className="w-3 h-3" />
                        Contextual Example
                      </h4>
                      <p className="text-stone-700 italic leading-relaxed text-sm font-serif">
                        &quot;{wordData?.usage}&quot;
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-stone-100 flex items-center justify-between shrink-0 bg-white">
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1b5f4a]" />
              AI Analysis
            </p>
            <div className="flex items-center gap-2">
              {onAskAbout && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-stone-500 hover:text-[#1b5f4a] gap-1.5 h-9 hover:bg-[#dfecc870]"
                  onClick={handleAskAbout}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Ask AI
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs gap-1.5 h-9",
                  isSaved
                    ? isDuplicate
                      ? "text-amber-600 bg-amber-50"
                      : "text-[#1b5f4a] bg-[#dfecc870]"
                    : "text-stone-500 hover:text-[#1b5f4a] hover:bg-[#dfecc870]"
                )}
                onClick={handleSave}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                {isSaved ? (isDuplicate ? "Already saved" : "Saved!") : "Flashcard"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ========================================
  // DESKTOP: Popover (unchanged)
  // ========================================
  return (
    <Popover open={true} onOpenChange={(open) => !open && onClose()}>
      {/* Invisible anchor positioned over the selection */}
      <PopoverAnchor
        style={{
          position: 'fixed',
          top: anchorRect?.top ?? 0,
          left: anchorRect?.left ?? 0,
          width: anchorRect?.width ?? 0,
          height: anchorRect?.height ?? 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      <PopoverContent
        className="p-0 bg-transparent border-none shadow-none w-auto animate-none data-[state=open]:animate-none data-[state=closed]:animate-none overflow-visible"
        side="top"
        align="center"
        sideOffset={10}
        collisionPadding={0}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        asChild
      >
        <motion.div
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          className="relative flex flex-col gap-1.5 overflow-visible pointer-events-auto items-start"
          onClick={(e) => e.stopPropagation()}
        >
          <HighlightToolbar
            dragControls={dragControls}
            isSaved={isSaved}
            isDuplicate={isDuplicate}
            isNoteSaved={isNoteSaved}
            isSpeaking={isSpeaking}
            isExpanded={isExpanded}
            onSave={handleSave}
            onSaveNote={handleSaveNote}
            onTTS={handleTTS}
            onExpand={() => setIsExpanded(!isExpanded)}
            onAskAbout={handleAskAbout}
            hasAskAbout={!!onAskAbout}
          />

          {isExpanded && (
            <HighlightExpandedView
              contentRef={contentRef}
              wordData={wordData || null}
              isLoading={isLoading}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              historyLength={history.length}
              onBack={handleBack}
              isSpeaking={isSpeaking}
              onTTS={handleTTS}
              isNoteSaved={isNoteSaved}
              onSaveNote={handleSaveNote}
              isSaved={isSaved}
              isDuplicate={isDuplicate}
              onSave={handleSave}
              onAskAbout={!!onAskAbout ? handleAskAbout : undefined}
            />
          )}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
