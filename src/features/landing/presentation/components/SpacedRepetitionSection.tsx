"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, MessageSquare, Brain, Sparkles, Check, ArrowRight } from "lucide-react";
import { useTranslations } from "../../i18n/useTranslations";

// Demo content stays in English
const DEMO_WORDS = [
  { word: "give you up", status: "overdue", daysAgo: 5 },
  { word: "let you down", status: "never-used", daysAgo: 0 },
  { word: "run around", status: "low-usage", daysAgo: 3 },
];

const DEMO_CHAT = {
  user: "I feel like my friend is always canceling plans on me.",
  ai: "That sounds frustrating! It's hard when someone keeps letting you down. Have you talked to them about it? Sometimes people don't realize they're running around with too many commitments.",
  highlighted: ["letting you down", "running around"],
};

// Static features content
const StaticFeatures = React.memo(function StaticFeatures({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="space-y-8">
      {/* Problem */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <h3 className="text-lg font-medium text-stone-900 mb-3">{t.spacedRepetition.problemTitle}</h3>
        <ul className="space-y-2 text-stone-600 text-sm">
          {t.spacedRepetition.problems.map((problem, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">✕</span>
              {problem}
            </li>
          ))}
        </ul>
      </div>

      {/* Solution Steps */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#dfecc870] flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-[#1b5f4a]" />
          </div>
          <div>
            <h4 className="font-medium text-stone-900 mb-1">{t.spacedRepetition.solution1Title}</h4>
            <p className="text-sm text-stone-500">
              {t.spacedRepetition.solution1Desc}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#dfecc870] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-[#1b5f4a]" />
          </div>
          <div>
            <h4 className="font-medium text-stone-900 mb-1">{t.spacedRepetition.solution2Title}</h4>
            <p className="text-sm text-stone-500">
              {t.spacedRepetition.solution2Desc}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#dfecc870] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#1b5f4a]" />
          </div>
          <div>
            <h4 className="font-medium text-stone-900 mb-1">{t.spacedRepetition.solution3Title}</h4>
            <p className="text-sm text-stone-500">
              {t.spacedRepetition.solution3Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export const SpacedRepetitionSection = React.memo(function SpacedRepetitionSection() {
  const [animationPhase, setAnimationPhase] = useState<
    "words" | "inject" | "chat" | "highlight" | "update" | "reset"
  >("words");
  const t = useTranslations();

  // Derived state for animation visibility
  const showWords = ["words", "inject", "chat", "highlight", "update"].includes(animationPhase);
  const showInject = ["inject", "chat", "highlight", "update"].includes(animationPhase);
  const showChat = ["chat", "highlight", "update"].includes(animationPhase);
  const showHighlight = ["highlight", "update"].includes(animationPhase);
  const showUpdate = ["update"].includes(animationPhase);

  // Animation loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (animationPhase === "words") {
      timeout = setTimeout(() => setAnimationPhase("inject"), 2000);
    } else if (animationPhase === "inject") {
      timeout = setTimeout(() => setAnimationPhase("chat"), 1500);
    } else if (animationPhase === "chat") {
      timeout = setTimeout(() => setAnimationPhase("highlight"), 2500);
    } else if (animationPhase === "highlight") {
      timeout = setTimeout(() => setAnimationPhase("update"), 2000);
    } else if (animationPhase === "update") {
      timeout = setTimeout(() => setAnimationPhase("reset"), 3000);
    } else if (animationPhase === "reset") {
      timeout = setTimeout(() => setAnimationPhase("words"), 1000);
    }

    return () => clearTimeout(timeout);
  }, [animationPhase]);

  // Render AI response with highlights
  const renderAiResponse = () => {
    if (!showHighlight) {
      return <p className="text-sm text-stone-700">{DEMO_CHAT.ai}</p>;
    }

    const text = DEMO_CHAT.ai;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    DEMO_CHAT.highlighted.forEach((phrase, i) => {
      const index = text.toLowerCase().indexOf(phrase.toLowerCase(), lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(text.slice(lastIndex, index));
        }
        parts.push(
          <span key={i} className="bg-[#dfecc8] text-[#1b5f4a] px-1 rounded animate-pulse">
            {text.slice(index, index + phrase.length)}
          </span>
        );
        lastIndex = index + phrase.length;
      }
    });
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <p className="text-sm text-stone-700">{parts}</p>;
  };

  return (
    <section id="features" className="py-24 px-6 bg-white w-[90%] mx-auto  rounded-[84px] mb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dfecc870] text-[#1b5f4a] rounded-full text-sm font-medium mb-6">
            <RefreshCw className="w-4 h-4" />
            {t.spacedRepetition.badge}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-normal text-stone-900 mb-6" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {t.spacedRepetition.title}
          </h2>
          
          <p className="text-lg text-stone-500 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {t.spacedRepetition.description}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: How it works */}
          <StaticFeatures t={t} />

          {/* Right: Animated Demo */}
          <div className="relative">
            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-linear-to-t from-[#C4B4FF] to-[#D0E4AC] blur-sm opacity-90 rounded-4xl" />
            
            <div className="bg-white rounded-4xl p-6 min-h-[500px] flex flex-col relative z-10 border border-stone-50">
            {/* Demo Title */}
            <div className="text-center mb-6">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                Live Demo
              </span>
            </div>

            {/* Priority Words */}
            {showWords && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  Flashcards
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEMO_WORDS.map((item, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-lg text-xs bg-stone-100 font-medium flex items-center gap-2"
                    >
                      {item.word}
                      <span className="opacity-60">
                        {item.status === "overdue"
                          ? `${item.daysAgo}d overdue`
                          : item.status === "never-used"
                          ? "never used"
                          : `${item.daysAgo}d ago`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inject Arrow */}
            {showInject && (
              <div className="flex justify-center mb-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-[#1b5f4a] text-xs font-medium">
                  <ArrowRight className="w-4 h-4" />
                  Injected into AI prompt
                </div>
              </div>
            )}

            {/* Chat Demo */}
            {showChat && (
              <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[#dfecc870] text-[#1b5f4a] rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm">{DEMO_CHAT.user}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                    {renderAiResponse()}
                  </div>
                </div>

                {/* Update confirmation */}
                {showUpdate && (
                  <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#dfecc870] text-[#1b5f4a] rounded-full text-xs font-medium">
                      <Check className="w-3 h-3" />
                      2 words practiced in context!
                    </div>
                  </div>
                )}
              </div>
            )}

            {!showChat && <div className="flex-1" />}
          </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {t.spacedRepetition.stats.map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-[#D0E4AC] mb-1">{item.stat}</div>
              <div className="text-sm text-stone-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
