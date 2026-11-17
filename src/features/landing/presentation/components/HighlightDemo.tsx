"use client";

import React, { useState, useEffect } from "react";
import { Volume2, BookOpen, Lightbulb, Layers, ArrowRightLeft, GripVertical, ChevronDown, ChevronUp, FileText, MessageCircle, Check } from "lucide-react";

// Demo data for the highlight popover
const DEMO_TEXT = "I'm never gonna give you up, never gonna let you down.";
const HIGHLIGHTED_WORD = "give you up";

const DEMO_WORD_DATA = {
  word: "give you up",
  tense: "Phrasal Verb",
  meaning: "To stop having a relationship with someone; to abandon or desert someone. In this song, Rick Astley promises eternal commitment.",
  synonyms: ["abandon", "desert", "forsake", "leave"],
  antonyms: ["keep", "hold onto", "stay with"],
  usage: "He promised he would never give her up, no matter what challenges they faced.",
  tip: "This phrasal verb is often used in romantic contexts to express loyalty and commitment.",
};

export function HighlightDemo() {
  const [animationPhase, setAnimationPhase] = useState<
    "text" | "highlight" | "toolbar" | "expand" | "tabs" | "reset"
  >("text");
  const [showHighlight, setShowHighlight] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"meaning" | "thesaurus" | "usage">("meaning");
  const [showSaved, setShowSaved] = useState(false);

  // Animation loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (animationPhase === "text") {
      // Show text first
      timeout = setTimeout(() => {
        setAnimationPhase("highlight");
      }, 1000);
    } else if (animationPhase === "highlight") {
      // Highlight the word
      setTimeout(() => setShowHighlight(true), 0);
      timeout = setTimeout(() => {
        setAnimationPhase("toolbar");
      }, 800);
    } else if (animationPhase === "toolbar") {
      // Show the toolbar
      setTimeout(() => setShowToolbar(true), 0);
      timeout = setTimeout(() => {
        setAnimationPhase("expand");
      }, 1500);
    } else if (animationPhase === "expand") {
      // Expand to show details
      setTimeout(() => setIsExpanded(true), 0);
      timeout = setTimeout(() => {
        setAnimationPhase("tabs");
      }, 2000);
    } else if (animationPhase === "tabs") {
      // Cycle through tabs
      if (activeTab === "meaning") {
        setTimeout(() => setActiveTab("thesaurus"), 0);
        timeout = setTimeout(() => {
          setActiveTab("usage");
        }, 1500);
      } else if (activeTab === "usage") {
        // Show save animation
        setTimeout(() => setShowSaved(true), 0);
        timeout = setTimeout(() => {
          setAnimationPhase("reset");
        }, 2000);
      }
    } else if (animationPhase === "reset") {
      // Reset everything
      setTimeout(() => {
        setShowHighlight(false);
        setShowToolbar(false);
        setIsExpanded(false);
        setActiveTab("meaning");
        setShowSaved(false);
      }, 0);
      timeout = setTimeout(() => {
        setAnimationPhase("text");
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [animationPhase, activeTab]);

  // Render text with highlight
  const renderText = () => {
    const parts = DEMO_TEXT.split(HIGHLIGHTED_WORD);
    return (
      <p className="text-sm text-stone-700 leading-relaxed">
        {parts[0]}
        <span
          className={`transition-all duration-300 ${
            showHighlight
              ? "bg-[#dfecc8] text-[#1b5f4a] px-1 rounded"
              : ""
          }`}
        >
          {HIGHLIGHTED_WORD}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full w-full px-6 py-8">
      {/* Chat bubble with text */}
      <div className="max-w-md mx-auto w-full">
        {/* AI Message with song lyrics */}
        <div className="bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-3 mb-4">
          <p className="text-xs text-stone-500 mb-2">From: Never Gonna Give You Up</p>
          {renderText()}
        </div>

        {/* Highlight Popover Demo */}
        {showToolbar && (
          <div className="flex flex-col items-start gap-1.5 animate-in fade-in slide-in-from-bottom-2">
            {/* Collapsed Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-stone-200/10 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
              {/* Drag Handle */}
              <div className="flex items-center justify-center text-stone-400">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Flashcards Button */}
              <button
                className={`p-2.5 rounded-md transition-all duration-200 ${
                  showSaved
                    ? "bg-[#1b5f4a] text-white"
                    : "bg-[#dfecc8] text-[#1b5f4a]"
                }`}
              >
                {showSaved ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              </button>

              {/* Notes Button */}
              <button className="p-2.5 rounded-md bg-violet-100 text-violet-600">
                <FileText className="w-4 h-4" />
              </button>

              {/* Chat Button */}
              <button className="p-2.5 rounded-md bg-[#dfecc8] text-[#1b5f4a]">
                <MessageCircle className="w-4 h-4" />
              </button>

              {/* Listen Button */}
              <button className="p-2.5 rounded-md bg-violet-100 text-violet-600">
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-stone-200" />

              {/* Expand Button */}
              <button className="p-2.5 rounded-md bg-white text-stone-400">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Expanded Panel */}
            {isExpanded && (
              <div className="bg-white/30 backdrop-blur-md shadow-sm rounded-3xl border border-white/20 w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
                {/* Header */}
                <div className="p-4 pb-3 bg-linear-to-b from-white/40 to-transparent">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-stone-800 capitalize">
                      {DEMO_WORD_DATA.word}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#dfecc870] text-[#1b5f4a] text-[10px] font-medium rounded uppercase">
                      {DEMO_WORD_DATA.tense}
                    </span>
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
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          activeTab === tab.id
                            ? "bg-white text-stone-700 shadow-sm"
                            : "text-stone-500"
                        }`}
                      >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 pt-2">
                  {activeTab === "meaning" && (
                    <div className="space-y-3 animate-in fade-in">
                      <p className="text-stone-700 text-sm leading-relaxed">
                        {DEMO_WORD_DATA.meaning}
                      </p>
                      <div className="bg-[#dfecc870] rounded-xl p-3 flex gap-2">
                        <div className="bg-[#1b5f4a] h-5 w-5 p-1 rounded-full text-[#dfecc8] shrink-0">
                          <Lightbulb className="w-3 h-3" />
                        </div>
                        <p className="text-xs text-[#1b5f4a]/80">
                          {DEMO_WORD_DATA.tip}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "thesaurus" && (
                    <div className="space-y-4 animate-in fade-in">
                      <div>
                        <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">
                          Similar Words
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {DEMO_WORD_DATA.synonyms.map((syn, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-[#dfecc870] text-[#1b5f4a] text-xs rounded-lg"
                            >
                              {syn}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">
                          Opposite Words
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {DEMO_WORD_DATA.antonyms.map((ant, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs rounded-lg"
                            >
                              {ant}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "usage" && (
                    <div className="animate-in fade-in">
                      <div className="bg-stone-100/50 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Example
                        </h4>
                        <p className="text-stone-700 italic text-sm">
                          {DEMO_WORD_DATA.usage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Demo label */}
      <p className="text-xs text-stone-400 text-center mt-auto pt-4">
        ↑ Highlight any word to get AI-powered explanations
      </p>
    </div>
  );
}
