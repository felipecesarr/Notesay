import React from "react";
import { GripVertical, Check, Layers, FileText, MessageCircle, Volume2, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { motion, DragControls } from "framer-motion";
import { cn } from "@/lib/utils";

interface HighlightToolbarProps {
  dragControls: DragControls;
  isSaved: boolean;
  isDuplicate?: boolean;
  isNoteSaved: boolean;
  isSpeaking: boolean;
  isExpanded: boolean;
  onSave: (e: React.MouseEvent) => void;
  onSaveNote: (e: React.MouseEvent) => void;
  onTTS: (e: React.MouseEvent) => void;
  onExpand: () => void;
  onAskAbout?: (e: React.MouseEvent) => void;
  hasAskAbout: boolean;
}

export function HighlightToolbar({
  dragControls,
  isSaved,
  isDuplicate = false,
  isNoteSaved,
  isSpeaking,
  isExpanded,
  onSave,
  onSaveNote,
  onTTS,
  onExpand,
  onAskAbout,
  hasAskAbout
}: HighlightToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 p-3 bg-stone-200/10 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20"
    >
      {/* Drag Handle Icon */}
      <div 
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dragControls.start(e);
        }}
        className="flex items-center justify-center text-stone-400 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Flashcards Button */}
      <div className="relative">
        <button
          onClick={onSave}
          className={cn(
            "p-2.5 rounded-md transition-all duration-200 hover:scale-105",
            isSaved 
              ? isDuplicate 
                ? "bg-amber-500 text-white shadow-md" 
                : "bg-[#1b5f4a] text-[#dfecc8] shadow-md" 
              : "bg-[#dfecc870] text-[#1b5f4a] hover:bg-[#dfecc8] hover:text-[#1b5f4a]"
          )}
          title={isSaved ? (isDuplicate ? "Already saved!" : "Saved!") : "Flashcards"}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
        </button>
      </div>

      {/* Notes Button */}
      <div className="relative">
        <button
          onClick={onSaveNote}
          className={cn(
            "p-2.5 rounded-md transition-all duration-200 hover:scale-105",
            isNoteSaved
              ? "bg-violet-500 text-white shadow-md"
              : "bg-violet-200/70 text-violet-600 hover:bg-violet-300/70 hover:text-violet-900"
          )}
          title={isNoteSaved ? "Saved!" : "Save to Notes"}
        >
          {isNoteSaved ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </button>
      </div>

      {/* Chat Button */}
      {hasAskAbout && (
        <div className="relative">
          <button
            onClick={onAskAbout}
            className="p-2.5 rounded-md bg-[#dfecc870] text-[#1b5f4a] hover:bg-[#dfecc8] hover:text-[#1b5f4a] transition-all duration-200"
            title="Ask AI"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Listen/TTS Button */}
      <div className="relative">
        <button
          onClick={onTTS}
          className={cn(
            "p-2.5 rounded-md transition-all duration-200",
            isSpeaking
              ? "bg-violet-500 text-white"
              : "bg-violet-100 text-violet-600 hover:bg-violet-200 hover:text-violet-900"
          )}
          title={isSpeaking ? "Stop" : "Listen"}
        >
          {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-stone-200" />

      {/* Expand/Collapse Toggle Button */}
      <div className="relative">
        <button
          onClick={onExpand}
          className="p-2.5 rounded-md bg-white text-stone-400 hover:text-stone-700 transition-colors"
          title={isExpanded ? "Collapse" : "See Details"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}
