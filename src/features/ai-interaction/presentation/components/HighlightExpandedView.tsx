import React from "react";
import { ArrowRightLeft, Volume2, Loader2, Check, FileText, BookOpen, Layers, Lightbulb, Sparkles, MessageCircle, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { cn } from "@/lib/utils";
import { WordData } from "@/features/ai-interaction/types";

export type Tab = "meaning" | "thesaurus" | "usage";

interface HighlightExpandedViewProps {
  wordData: WordData | null;
  isLoading: boolean;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  historyLength: number;
  onBack: () => void;
  isSpeaking: boolean;
  onTTS: (e: React.MouseEvent) => void;
  isNoteSaved: boolean;
  onSaveNote: (e: React.MouseEvent) => void;
  isSaved: boolean;
  isDuplicate?: boolean;
  onSave: (e: React.MouseEvent) => void;
  onAskAbout?: (e: React.MouseEvent) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function HighlightExpandedView({
  wordData,
  isLoading,
  activeTab,
  setActiveTab,
  historyLength,
  onBack,
  isSpeaking,
  onTTS,
  isNoteSaved,
  onSaveNote,
  isSaved,
  isDuplicate = false,
  onSave,
  onAskAbout,
  contentRef
}: HighlightExpandedViewProps) {
  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, scaleY: 0.8, originY: 0, x: "-50%" }}
      animate={{ opacity: 1, scaleY: 1, x: "-50%" }}
      exit={{ opacity: 0, scaleY: 0.8, x: "-50%" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white/40 backdrop-blur-md shadow-sm rounded-3xl border border-white/20 w-md max-w-md max-h-[85vh] overflow-hidden flex flex-col"
      style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", zIndex: 9998 }}
    >
      {/* Header Section - Fixed */}
      <div className="p-6 pb-4 bg-linear-to-b from-white/40 to-transparent shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Back Button (if history exists) */}
            {historyLength > 0 && (
              <div 
                onClick={onBack}
                className="mt-1 cursor-pointer text-stone-400 hover:text-stone-600 transition-colors"
                title="Back"
              >
                <ArrowRightLeft className="w-5 h-5 rotate-180" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-stone-800 capitalize tracking-tight font-serif wrap-break-word hyphens-auto leading-tight">
                {isLoading ? "Analyzing..." : wordData?.word}
              </h3>
              {wordData?.tense && wordData.tense !== "N/A" && (
                <Badge variant="secondary" className="bg-[#1b5f4a] text-[#dfecc8] hover:bg-[#1b5f4a] text-[10px] uppercase tracking-wider border-none shrink-0">
                  {wordData.tense}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all",
                isSpeaking 
                  ? "bg-violet-200 text-violet-700 hover:bg-violet-300" 
                  : "hover:bg-violet-50 text-stone-600"
              )}
              onClick={onTTS}
              title={isSpeaking ? "Stop" : "Listen"}
            >
              {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full hover:bg-[#dfecc870] transition-all duration-300",
                isNoteSaved ? "text-[#1b5f4a] bg-[#dfecc870]" : "text-stone-600"
              )}
              onClick={onSaveNote}
              title="Add to Notes"
            >
              {isNoteSaved ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-stone-200/50 rounded-xl gap-1">
          {[
            { id: "meaning", icon: BookOpen, label: "Meaning" },
            { id: "thesaurus", icon: ArrowRightLeft, label: "Thesaurus" },
            { id: "usage", icon: Layers, label: "Usage" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab.id as Tab);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white text-stone-500 shadow-sm"
                  : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Scrollable with Fades */}
      <div className="flex-1 min-h-0 relative">
        {/* Top Fade */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-white/90 to-transparent z-20 pointer-events-none" />
        
        {/* Scrollable Container with Hidden Scrollbar */}
        <div 
            className="h-full overflow-y-auto scroll-smooth no-scrollbar"
            style={{ 
                scrollbarWidth: 'none',  /* Firefox */
                msOverflowStyle: 'none'  /* IE and Edge */
            }}
        >
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-8 h-8 border-2 border-[#1b5f4a] border-t-[#dfecc8] rounded-full animate-spin" />
              <p className="text-xs text-[#1b5f4a] font-medium uppercase tracking-wider">Analyzing...</p>
            </div>
          ) : (
          <div className="p-6 pt-2">
            <AnimatePresence mode="wait">
              {activeTab === "meaning" && (
                <motion.div
                  key="meaning"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="prose prose-stone prose-sm max-w-none">
                    <p className="text-stone-900 text-sm leading-relaxed font-medium">
                      {wordData?.meaning}
                    </p>
                  </div>
                  
                  {/* Smart Insight */}
                  {wordData?.interviewTip && (
                    <div className="bg-[#dfecc870] rounded-xl p-4 flex gap-3">
                      <div className="p-2 bg-[#dfecc870] rounded-lg h-fit text-[#1b5f4a] shrink-0">
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
                  className="space-y-6"
                >
                  {wordData?.synonyms && wordData.synonyms.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1b5f4a]" />
                        Similar Words
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {wordData.synonyms.map((syn, i) => (
                          <span key={i} className="px-3 py-1.5 bg-[#dfecc870] text-[#1b5f4a] text-xs font-medium rounded-lg border border-[#dfecc870]">
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
                          <span key={i} className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-medium rounded-lg border border-stone-200">
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
                  className="space-y-4"
                >
                  <div className="bg-stone-100/50 p-5 rounded-xl border border-stone-200/50">
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
          </div>
        )}
        </div>
        
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white/95 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Footer Actions - Fixed */}
      <div className="p-4 border-t border-stone-100/50 bg-white/20 flex justify-between items-center shrink-0">
        <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#1b5f4a]" />
          AI Powered Analysis
        </p>
        <div className="flex items-center gap-2">
          {onAskAbout && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-stone-500 hover:text-[#1b5f4a] gap-1.5 h-8 hover:bg-[#dfecc870]"
              onClick={onAskAbout}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ask about this
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs gap-1.5 h-8",
              isSaved 
                ? isDuplicate 
                  ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                  : "text-[#1b5f4a] hover:text-[#1b5f4a] hover:bg-[#dfecc870]"
                : "text-stone-500 hover:text-[#1b5f4a] hover:bg-[#dfecc870]"
            )}
            onClick={onSave}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
            {isSaved ? (isDuplicate ? "Already saved" : "Saved") : "Add to Flashcards"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
