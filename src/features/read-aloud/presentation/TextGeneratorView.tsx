"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight, Loader2, Search, X, ChevronDown, Check } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface TextGeneratorViewProps {
  flashcards: { id: string; front: string }[];
  selectedCardIds: Set<string>;
  selectedTopics: string[];
  selectedSize: 'small' | 'medium' | 'large';
  isLoading: boolean;
  onBack: () => void;
  onToggleCard: (id: string) => void;
  onToggleTopicSelection: (topic: string) => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onGenerate: () => void;
}

type Step = 1 | 2 | 3;

const TOPICS = [
  "Technology", "Business", "Travel", "Daily Life", "Science",
  "History", "Art & Culture", "Movies", "Music", "Sports",
  "Health", "Nature", "Politics", "Education", "Relationships",
  "Work", "Hobbies", "Fashion", "Literature", "Philosophy"
];

export function TextGeneratorView({
  flashcards,
  selectedCardIds,
  selectedTopics,
  selectedSize,
  isLoading,
  onBack,
  onToggleCard,
  onToggleTopicSelection,
  onSizeChange,
  onGenerate
}: TextGeneratorViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCards, setShowAllCards] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const canGenerate = selectedTopics.length >= 1 && selectedTopics.length <= 3;
  const step2Complete = selectedTopics.length >= 1 && selectedTopics.length <= 3;

  // Filter flashcards based on search query
  const filteredFlashcards = useMemo(() => {
    if (!searchQuery.trim()) return flashcards;
    const query = searchQuery.toLowerCase();
    return flashcards.filter(card =>
      card.front.toLowerCase().includes(query)
    );
  }, [flashcards, searchQuery]);

  // Determine how many cards to display
  const displayLimit = showAllCards ? filteredFlashcards.length : 30;
  const visibleCards = filteredFlashcards.slice(0, displayLimit);
  const hasMoreCards = filteredFlashcards.length > displayLimit;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 h-7 w-7 bg-transparent hover:bg-stone-100">
          <ChevronRight className="w-4 h-4 rotate-180 text-stone-500" />
        </Button>
        <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Generate New Text</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Step 1: Vocabulary (Optional) */}
        <section>
          <button
            onClick={() => setCurrentStep(1)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-bold text-stone-500">1</div>
              <h3 className="text-[10px] font-semibold text-stone-700 uppercase tracking-wider">
                Vocabulary <span className="text-stone-400 font-normal">(Optional)</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedCardIds.size > 0 && (
                <span className="text-[9px] text-[#1b5f4a] font-medium">
                  {selectedCardIds.size} selected
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${currentStep === 1 ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {currentStep === 1 && (
            <div className="mt-2 space-y-2">
              {/* Search Bar */}
              {flashcards.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search flashcards..."
                    className="w-full pl-7 pr-7 py-1.5 text-[10px] bg-stone-50 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1b5f4a70] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Flashcard List */}
              <div className="max-h-64 overflow-y-auto bg-stone-50 rounded-md p-2">
                {isLoading && flashcards.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                  </div>
                ) : flashcards.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-stone-500">No flashcards yet</p>
                  </div>
                ) : filteredFlashcards.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-stone-500">No results</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {visibleCards.map(card => {
                      const isSelected = selectedCardIds.has(card.id);
                      return (
                        <div
                          key={card.id}
                          onClick={() => onToggleCard(card.id)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white cursor-pointer transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#1b5f4a] border-[#1b5f4a]'
                              : 'bg-white border-stone-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 text-[#dfecc8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-700">{card.front}</span>
                        </div>
                      );
                    })}
                    {hasMoreCards && (
                      <button
                        onClick={() => setShowAllCards(!showAllCards)}
                        className="w-full py-1.5 text-[9px] text-[#1b5f4a] hover:text-[#1b5f4a] font-medium"
                      >
                        {showAllCards ? 'Show less' : `Show ${filteredFlashcards.length - displayLimit} more`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-[#dfecc870] text-[#1b5f4a] hover:bg-[#dfecc8] hover:text-[#1b5f4a] h-8 rounded-md text-[10px] font-medium"
              >
                Continue
              </Button>
            </div>
          )}
        </section>

        {/* Step 2: Topics (Required) */}
        <section>
          <button
            onClick={() => setCurrentStep(2)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-bold text-stone-500">2</div>
              <h3 className="text-[10px] font-semibold text-stone-700 uppercase tracking-wider">
                Topics (1-3) <span className="text-rose-500">*</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {step2Complete && (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {selectedTopics.length > 0 && (
                <span className="text-[9px] text-stone-500 font-medium">
                  {selectedTopics.length}/3
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${currentStep === 2 ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {currentStep === 2 && (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => onToggleTopicSelection(topic)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
                        isSelected
                          ? "bg-[#1b5f4a] text-[#dfecc8]"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!step2Complete}
                className="w-full bg-[#dfecc870] text-[#1b5f4a] hover:bg-[#dfecc8] hover:text-[#1b5f4a] h-8 rounded-md text-[10px] font-medium disabled:opacity-50 disabled:bg-stone-100 disabled:text-stone-400"
              >
                {step2Complete ? 'Continue' : 'Select 1-3 Topics'}
              </Button>
            </div>
          )}
        </section>

        {/* Step 3: Length (Required) */}
        <section>
          <button
            onClick={() => setCurrentStep(3)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-bold text-stone-500">3</div>
              <h3 className="text-[10px] font-semibold text-stone-700 uppercase tracking-wider">
                Length <span className="text-rose-500">*</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedSize && (
                <span className="text-[9px] text-stone-500 font-medium capitalize">
                  {selectedSize}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${currentStep === 3 ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {currentStep === 3 && (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'small' as const, label: 'Small', desc: '~300 words' },
                  { id: 'medium' as const, label: 'Medium', desc: '~600 words' },
                  { id: 'large' as const, label: 'Large', desc: '~1000 words' }
                ].map((sizeOpt) => {
                  const isSelected = selectedSize === sizeOpt.id;
                  return (
                    <button
                      key={sizeOpt.id}
                      onClick={() => onSizeChange(sizeOpt.id)}
                      className={`p-3 rounded-md transition-colors text-center ${
                        isSelected
                          ? "bg-[#1b5f4a] text-[#dfecc8]"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      <div className="text-[10px] font-semibold">{sizeOpt.label}</div>
                      <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-[#dfecc8]' : 'text-stone-500'}`}>
                        {sizeOpt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Action Bar */}
      <div className="p-4 shrink-0">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full bg-[#dfecc870] text-[#1b5f4a] hover:bg-[#dfecc8] h-9 rounded-md text-[10px] font-medium disabled:opacity-50 disabled:bg-stone-200 disabled:text-stone-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
              Generating...
            </>
          ) : !canGenerate ? (
            "Complete Step 2 to Generate"
          ) : (
            "Generate Text"
          )}
        </Button>
      </div>
    </div>
  );
}
