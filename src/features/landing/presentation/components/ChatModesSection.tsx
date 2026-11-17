"use client";

import React, { useState } from "react";
import { Waves, GraduationCap, Briefcase, MessageSquareQuote, Zap, BookOpen } from "lucide-react";
import { useTranslations } from "../../i18n/useTranslations";

// Demo content stays in English
const MODES = [
  {
    id: "chill",
    name: "Chill",
    icon: Waves,
    description: "Casual conversation with slang",
    response: "Yo that sounds dope! 🌍 Traveling is honestly the best way to find yourself. Where you tryna go first?",
  },
  {
    id: "teacher",
    name: "Teacher",
    icon: GraduationCap,
    description: "Patient, educational style",
    response: "That's a big decision! 📚 Traveling can be a wonderful learning experience. Have you thought about what skills you'd like to develop?",
  },
  {
    id: "formal",
    name: "Formal",
    icon: Briefcase,
    description: "Professional, business-appropriate",
    response: "I understand your perspective. Taking a sabbatical can provide valuable life experience. Have you considered the career impact?",
  },
  {
    id: "debater",
    name: "Debater",
    icon: MessageSquareQuote,
    description: "Challenge ideas respectfully",
    response: "I see your point, but is it wise to leave a stable income right now? 🧐 One could argue that saving up first is safer.",
  },
  {
    id: "concise",
    name: "Concise",
    icon: Zap,
    description: "Quick, efficient responses",
    response: "Bold move. Savings ready? ✈️",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    icon: BookOpen,
    description: "Narrative, descriptive style",
    response: "Oh man, that reminds me of when I backpacked through the Andes... 🏔️ The freedom was absolute magic.",
  },
];

export function ChatModesSection() {
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const t = useTranslations();

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Content & Mode Selector */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-normal text-stone-900 mb-6 tracking-tight" style={{ fontFamily: "var(--font-geist-sans)" }}>
                {t.chatModes.title}
              </h2>
              <p className="text-lg text-stone-500 leading-relaxed">
                {t.chatModes.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 flex flex-col gap-3 ${
                    activeMode.id === mode.id
                      ? "bg-[#1b5f4a] text-[#dfecc8]"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200/70"
                  }`}
                >
                  <div className={`flex items-center gap-3 ${
                    activeMode.id === mode.id
                      ? "bg-[#dfecc8] text-[#1b5f4a] px-1 py-1 rounded-full w-fit"
                      : "bg-transparent text-stone-900 px-1 py-1 rounded-full w-fit"
                  }`}>
                    <mode.icon className={`w-5 h-5 p-1 rounded-full ${
                      activeMode.id === mode.id ? "text-[#dfecc8] bg-[#1b5f4a]" : "text-stone-900 bg-transparent"
                    }`} />
                    <span className={`text-sm font-semibold mr-1 ${
                      activeMode.id === mode.id ? "text-[#1b5f4a]" : "text-stone-900"
                    }`}>
                      {mode.name}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    activeMode.id === mode.id ? "text-[#dfecc8]" : "text-stone-500"
                  }`}>
                    {mode.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Clean Chat Interface */}
          <div className="relative pt-8">
             {/* Chat Container */}
            <div className="bg-stone-50 rounded-[2.5rem] p-8 min-h-[500px] flex flex-col justify-between">
              
              {/* Messages Area */}
              <div className="flex-1 space-y-8">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-white text-stone-900 rounded-2xl rounded-br-sm px-5 py-3 max-w-[85%]">
                    <p className="text-sm leading-relaxed">I&apos;m thinking about quitting my job to travel the world for a year. 🌎</p>
                  </div>
                </div>

                {/* AI Response - Text Only (No Bubble) */}
                <div className="flex gap-4 animate-in fade-in duration-500 key={activeMode.id}">
                  <div className="w-8 h-8 rounded-full bg-[#1b5f4a] flex items-center justify-center shrink-0 mt-1">
                    <activeMode.icon className="w-4 h-4 text-[#dfecc8]" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{activeMode.name} AI</span>
                    </div>
                    <p className="text-stone-700 text-sm leading-relaxed">
                      {activeMode.response}
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Mockup - Flat & Minimal */}
              <div className="bg-white rounded-full p-2 pl-4 flex items-center justify-between mt-8">
                <span className="text-stone-400 text-sm">Type a message...</span>
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-stone-400" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
