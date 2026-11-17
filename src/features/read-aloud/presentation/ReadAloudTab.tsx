"use client";

import React, { useState } from "react";
import { Plus, Loader2, Trash2, Download, Check, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { PracticeText, generatePracticeText, savePracticeText, saveProgress, deletePracticeText } from "../controller"; // Removed getProgress, getPracticeTexts
import { usePracticeTexts } from "../hooks/usePracticeTexts";
import { useFlashcards } from "@/features/flashcards/hooks/useFlashcards";
import { PracticePlayer } from "./PracticePlayer";
import { TextGeneratorView } from "./TextGeneratorView";
import { ReadAloudEmptyState } from "./ReadAloudEmptyState";
import { generatePracticeTextPdf } from "../controller/pdf-generator";

type ViewState = "library" | "generator" | "practice";

export function ReadAloudTab() {
  const { texts, textProgress, isLoading: isTextsLoading, refetchPracticeTexts } = usePracticeTexts();
  const { flashcards, isLoading: isFlashcardsLoading } = useFlashcards();

  const [view, setView] = useState<ViewState>("library");
  // const [texts, setTexts] = useState<PracticeText[]>([]); // Removed
  const [selectedText, setSelectedText] = useState<PracticeText | null>(null);
  const [isGenerating, setIsGenerating] = useState(false); // Renamed from isLoading
  // const [textProgress, setTextProgress] = useState<Record<string, ProgressMap>>({}); // Removed
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // Track which text is being deleted

  // const [flashcards, setFlashcards] = useState<{id: string, front: string}[]>([]); // Removed
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Removed useEffect loading texts
  // Removed loadFlashcardsForGenerator function

  const toggleCardSelection = (id: string) => {
    const newSelected = new Set(selectedCardIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCardIds(newSelected);
  };

  const toggleTopicSelection = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else if (prev.length < 3) {
        // Allow up to 3 topics
        return [...prev, topic];
      } else {
        // Already have 3, don't add more
        return prev;
      }
    });
  };

  const handleGenerate = async () => {
    // Require at least 1 topic
    if (selectedTopics.length < 1) return;
    
    setIsGenerating(true);
    
    // Get selected words
    const selectedWords = flashcards
      .filter(f => selectedCardIds.has(f.id))
      .map(f => f.front);

    // Generate text
    const genResult = await generatePracticeText(selectedTopics, selectedSize, selectedWords);
    
    if (genResult.success && genResult.title && genResult.content) {
      // Save text with topics joined
      const topicsString = selectedTopics.join(", ");
      const saveResult = await savePracticeText(genResult.title, genResult.content, topicsString);
      if (saveResult.success) {
        await refetchPracticeTexts();
        setView("library");
        // Reset selection
        setSelectedCardIds(new Set());
        setSelectedTopics([]);
        setSelectedSize('medium');
      }
    }
    setIsGenerating(false);
  };

  const handleProgressChange = async (mode: string, completedChunks: number, totalChunks: number, completedIndices: number[]) => {
    if (selectedText) {
      await saveProgress(selectedText.id, mode, completedChunks, totalChunks, completedIndices);
      refetchPracticeTexts();
    }
  };

  const handleDeleteText = async (textId: string) => {
    setIsGenerating(true);
    const result = await deletePracticeText(textId);
    if (result.success) {
      await refetchPracticeTexts();
      setDeleteConfirmId(null); // Close confirmation
    } else {
      alert(result.error || "Failed to delete text");
    }
    setIsGenerating(false);
  };

  const handleDownloadPDF = async (text: PracticeText) => {
    try {
      await generatePracticeTextPdf(text);
    } catch (error) {
      console.error("Failed to generate PDF:");
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (view === "library") {
    return (
      <div data-tour="readaloud-tab" className="flex flex-col h-full bg-white">
        <div className="px-4 py-5 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Library texts</h2>
          <Button 
            onClick={() => {
              setView("generator");
              // Flashcards auto-loaded by hook
            }}
            className="bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-md h-7 text-[10px] px-3"
          >
            <Plus className="w-3 h-3 mr-1" />
            New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isTextsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
            </div>
          ) : texts.length === 0 ? (
            <ReadAloudEmptyState />
          ) : (
            <div className="grid gap-2">
              {texts.map((text) => {
                return (
                  <div
                    key={text.id}
                    className="bg-stone-50 p-3 rounded-md hover:bg-stone-100 transition-colors relative group"
                  >
                    <div
                      onClick={() => {
                        setSelectedText(text);
                        setView("practice");
                      }}
                      className="cursor-pointer"
                    >
                      <h3 className="text-xs font-semibold text-stone-900 mb-1">
                        {text.title}
                      </h3>
                      <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed mb-2">
                        {text.content}
                      </p>

                      <div className="flex items-center gap-1.5">
                        {text.topic.split(", ").map((topic, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#defcc890] text-[#1b5f4a] text-[9px] font-medium rounded-md">
                            {topic}
                          </span>
                        ))}
                        <span className="text-[9px] text-stone-400">
                          {new Date(text.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      {deleteConfirmId === text.id ? (
                        // Delete confirmation - inline style like ChatHeader
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-50/80 backdrop-blur-sm rounded-md">
                          <span className="text-[9px] font-medium text-red-700 mr-0.5">
                            Delete?
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteText(text.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                            title="Confirm delete"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="p-1 hover:bg-stone-100 rounded text-stone-500 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(text);
                            }}
                            className="p-1.5 hover:bg-stone-100 rounded-md transition-colors"
                            aria-label={`Download ${text.title} as PDF`}
                            title="Download as PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-stone-600 hover:w-4 hover:h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(text.id);
                            }}
                            className="p-1.5 hover:bg-stone-100 rounded-md transition-colors"
                            aria-label={`Delete ${text.title}`}
                            title="Delete this text"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-stone-600 hover:w-4 hover:h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "generator") {
    return (
      <TextGeneratorView
        flashcards={flashcards}
        selectedCardIds={selectedCardIds}
        selectedTopics={selectedTopics}
        selectedSize={selectedSize}
        isLoading={isGenerating || isFlashcardsLoading}
        onBack={() => setView("library")}
        onToggleCard={toggleCardSelection}
        onToggleTopicSelection={toggleTopicSelection}
        onSizeChange={setSelectedSize}
        onGenerate={handleGenerate}
      />
    );
  }



  if (view === "practice" && selectedText) {
    return (
      <PracticePlayer 
        text={selectedText} 
        onBack={() => setView("library")}
        progressData={textProgress[selectedText.id]}
        onProgressChange={handleProgressChange}
      />
    );
  }

  return null;
}
