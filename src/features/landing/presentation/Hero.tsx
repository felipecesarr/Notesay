"use client";

import React, { useState } from "react";
import { MessageSquare, Highlighter, Layers, FileText } from "lucide-react";
import { YouTubeInputDemo } from "./components/YouTubeInputDemo";
import { PDFInputDemo } from "./components/PDFInputDemo";
import { ChatDemo } from "./components/ChatDemo";
import { HighlightDemo } from "./components/HighlightDemo";
import { FlashcardsDemo } from "./components/FlashcardsDemo";
import { useTranslations } from "../i18n/useTranslations";

type TabId = "youtube" | "pdf" | "chat" | "highlight" | "flashcards";

export function Hero() {
  const [activeTab, setActiveTab] = useState<TabId>("youtube");
  const t = useTranslations();

  const TABS = [
    {
      id: "youtube" as TabId,
      label: t.hero.tabs.youtube.label,
      headline: t.hero.tabs.youtube.headline,
      description: t.hero.tabs.youtube.description,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      id: "pdf" as TabId,
      label: t.hero.tabs.pdf.label,
      headline: t.hero.tabs.pdf.headline,
      description: t.hero.tabs.pdf.description,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "chat" as TabId,
      label: t.hero.tabs.chat.label,
      headline: t.hero.tabs.chat.headline,
      description: t.hero.tabs.chat.description,
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: "highlight" as TabId,
      label: t.hero.tabs.highlight.label,
      headline: t.hero.tabs.highlight.headline,
      description: t.hero.tabs.highlight.description,
      icon: <Highlighter className="w-4 h-4" />,
    },
    {
      id: "flashcards" as TabId,
      label: t.hero.tabs.flashcards.label,
      headline: t.hero.tabs.flashcards.headline,
      description: t.hero.tabs.flashcards.description,
      icon: <Layers className="w-4 h-4" />,
    },
  ];

  const activeTabData = TABS.find(tab => tab.id === activeTab) || TABS[0];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "youtube":
        return <YouTubeInputDemo />;
      case "pdf":
        return <PDFInputDemo />;
      case "chat":
        return <ChatDemo />;
      case "highlight":
        return <HighlightDemo />;
      case "flashcards":
        return <FlashcardsDemo />;
      default:
        return <YouTubeInputDemo />;
    }
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background gradient: top to bottom, fading down - using YOUR brand colors */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(208, 228, 172, 1), rgba(196, 180, 255, 0.3) 50%, rgba(255, 249, 230, 0.2) 90%, transparent 100%)"
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">


        {/* Dynamic Main Headline - changes based on selected tab */}
        <h1 
          className="text-4xl md:text-4xl lg:text-5xl text-stone-900 tracking-tight leading-[1.1] font-normal mb-6 transition-all duration-300"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          {activeTabData.headline}
        </h1>
        
        {/* Dynamic Subtitle - changes based on selected tab */}
        <p className="text-stone-900 text-base md:text-lg font-normal mb-6 max-w-2xl mx-auto transition-all duration-300" style={{ fontFamily: "var(--font-geist-sans)" }}>
          {activeTabData.description}
        </p>

        {/* Product Preview */}
        <div className="mt-20 max-w-3xl mx-auto">
          {/* Tab Selector - matching app UI pattern */}
          <div className="flex flex-wrap items-center justify-center gap-1 mb-6">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "bg-white/70 text-stone-900"
                        : "bg-transparent text-stone-900 hover:bg-white/30"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area - Browser mockup */}
          <div className="bg-white rounded-xl shadow-2xl shadow-stone-200/50 border border-stone-200/60 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-stone-50 border-b border-stone-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-stone-300" />
                <div className="w-3 h-3 rounded-full bg-stone-300" />
                <div className="w-3 h-3 rounded-full bg-stone-300" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-xs mx-auto bg-white rounded-md px-3 py-1 text-xs text-stone-400 border border-stone-200 text-center">
                  notesay.online
                </div>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="min-h-[400px] bg-white">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
