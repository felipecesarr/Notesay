"use client";

import React, { useState } from "react";
import { Volume2, Mic, RotateCw, ChevronRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "../../i18n/useTranslations";

type ModeType = "read-aloud" | "shadowing" | "listening";

// Shared "Real App" styling constants
const UI = {
  progressBlob: "h-1 bg-stone-100 rounded-full overflow-hidden",
  progressFill: "h-full bg-violet-400 transition-all duration-300",
  chunkActive: "bg-violet-50 text-stone-900 rounded-md px-2 py-1 transition-colors",
  chunkInactive: "hover:bg-stone-50 px-2 py-1 rounded-md transition-colors text-stone-600",
  iconBtn: "opacity-40 hover:opacity-100 transition-opacity",
  loopBtn: "px-1.5 py-0.5 text-[9px] font-medium text-violet-600 hover:bg-violet-100 rounded-md transition-colors",
  doneBtn: "px-1.5 py-0.5 text-[9px] font-medium text-stone-500 hover:bg-stone-100 rounded-md transition-colors",
};

// Demo content stays in English
const MODES = [
  {
    id: "read-aloud" as ModeType,
    title: "Read Aloud",
    description: "Listen to natural AI voices reading text. Perfect for passive listening and comprehension.",
    content: (
      <div className="h-full flex flex-col p-2">
        <h1 className="text-lg font-bold text-stone-900 mb-6 leading-tight">
          Chapter 1: The Beginning
        </h1>
        <div className="space-y-4">
          <p className="text-stone-900 text-sm bg-violet-50 px-3 py-2 rounded-md leading-relaxed">
            Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse...
            <button className="inline-flex ml-2 align-middle opacity-100">
               <Volume2 className="w-3.5 h-3.5 text-violet-500" />
            </button>
          </p>
          <p className="text-stone-500 px-3 py-2 text-sm leading-relaxed">
            and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.
          </p>
          <p className="text-stone-500 px-3 py-2 text-sm leading-relaxed">
            It is a way I have of driving off the spleen and regulating the circulation.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "shadowing" as ModeType,
    title: "Shadowing",
    description: "Repeat after the speaker chunk-by-chunk. Improve pronunciation and fluency.",
    content: (
      <div className="h-full flex flex-col p-2">
        <div className="mb-6 pb-3 border-b border-stone-100">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Progress</span>
                <span className="text-[10px] font-semibold text-stone-700">1/3 completed</span>
            </div>
            <div className={UI.progressBlob}>
                <div className={UI.progressFill} style={{ width: '33%' }} />
            </div>
        </div>

        <div className="space-y-3">
            <div className="px-2 py-1 rounded-md bg-violet-100 group">
                <div className="flex justify-between items-center">
                    <p className="text-base leading-relaxed cursor-pointer text-stone-800">
                        The most important thing
                    </p>
                    <span className="px-1.5 py-0.5 text-[9px] font-medium text-stone-500 bg-white/50 rounded-md">
                        ↻ Undo
                    </span>
                </div>
            </div>

            <div className="bg-violet-50 px-2 py-1 rounded-md group">
                <p className="text-base leading-relaxed cursor-pointer text-stone-800">
                    is to enjoy your life
                    <span className="inline-flex items-center ml-2 gap-1.5">
                        <button className={UI.iconBtn}>
                             <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                        </button>
                        <button className={UI.loopBtn}>
                             Looping (2)
                        </button>
                        <button className={UI.doneBtn}>
                             ✓ Done
                        </button>
                    </span>
                </p>
            </div>

            <div className="hover:bg-stone-50 px-2 py-1 rounded-md transition-colors">
                <p className="text-base leading-relaxed cursor-pointer text-stone-800">
                     to be happy, it&apos;s all that matters.
                </p>
            </div>
        </div>
      </div>
    )
  },
  {
    id: "listening" as ModeType,
    title: "Listening",
    description: "Type what you hear to test your ear. We'll grade your accuracy instantly.",
    content: (
      <div className="h-full flex flex-col p-2">
        <div className="mb-6 pb-3 border-b border-stone-100">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Progress</span>
                <span className="text-[10px] font-semibold text-stone-700">3/4 correct</span>
            </div>
            <div className={UI.progressBlob}>
                <div className={UI.progressFill} style={{ width: '75%' }} />
            </div>
        </div>

        <div className="space-y-4">
             <div className="flex items-start gap-2 mb-2">
                 <button className="mt-1 inline-flex transition-opacity hover:opacity-100 opacity-100">
                     <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                 </button>
                 <div className="flex-1 space-y-2">
                     <div className="text-xs font-medium text-violet-600">
                         ✓ Perfect! <span className="ml-1.5 text-stone-400">100%</span>
                     </div>
                     <button className="text-[10px] font-medium text-stone-500 hover:text-stone-700">
                         ↻ Undo
                     </button>
                 </div>
             </div>

             <div className="bg-stone-100 px-2 py-2 rounded-md group">
                 <div className="flex items-start gap-2 mb-2">
                    <button className="mt-1 inline-flex transition-opacity opacity-40 hover:opacity-100">
                         <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                    </button>
                    <div className="flex-1">
                        <button className="text-[10px] font-medium text-violet-400 hover:text-violet-600 mb-1">
                            Show text (for beginners)
                        </button>
                        <div className="relative">
                            <div className="w-full px-0 py-1 text-sm bg-transparent border-b border-stone-200 text-stone-800 font-medium">
                                The most impor
                                <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse align-middle ml-px" />
                            </div>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">Type what you hear...</p>
                    </div>
                 </div>
             </div>
        </div>
      </div>
    )
  }
];

export const ReadAloudSection = React.memo(function ReadAloudSection() {
  const [activeId, setActiveId] = useState<ModeType>("read-aloud");
  const activeMode = MODES.find((m) => m.id === activeId) || MODES[0];
  const t = useTranslations();

  return (
    <section className="py-24 px-6 bg-white rounded-b-[64px] relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block">
                {t.readAloud.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-stone-900 tracking-tight" style={{ fontFamily: "var(--font-geist-sans)" }}>
                {t.readAloud.title}
            </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Selection List */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveId(mode.id)}
                className={`text-left transition-colors duration-500 group rounded-4xl relative overflow-hidden ${
                  activeId === mode.id ? "p-8" : "p-6 hover:bg-stone-100"
                }`}
              >
                 {activeId === mode.id && (
                     <motion.div 
                        layoutId="active-bg"
                        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} 
                        className="absolute inset-0 bg-[#dfecc8] rounded-4xl z-0 shadow-lg"
                     />
                 )}
                 <div className="relative z-10">
                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-500 ${
                        activeId === mode.id ? "text-[#1b5f4a]" : "text-stone-900 group-hover:text-stone-700"
                    }`}>
                    {mode.title}
                    </h3>
                    <p className={`text-sm leading-relaxed max-w-sm transition-colors duration-500 ${
                        activeId === mode.id ? "text-[#1b5f4a]" : "text-stone-500"
                    }`}>
                    {mode.description}
                    </p>
                    
                    <AnimatePresence>
                    {activeId === mode.id && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="flex items-center text-xs font-medium text-[#1b5f4a] overflow-hidden"
                        >
                            Try it now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Stacked Deck Visuals */}
          <div className="lg:col-span-7 relative h-[600px] bg-[#dfecc8] rounded-[2.5rem] p-12 overflow-hidden flex items-center justify-center">
             
             {/* Background Blob */}
             <div className="absolute inset-0 bg-linear-to-tr from-[#dfecc830] via-violet-400 to-[#dfecc830] opacity-60 blur-3xl" />

             <div className="relative w-full max-w-md aspect-4/5 h-[540px]">
                
                 {/* Decorative Stack - Static and Outside Animation to stay persistent */}
                 <div className="absolute inset-0 z-0">
                    <div className="absolute top-4 left-6 right-6 bottom-0 bg-white rounded-3xl shadow-md border border-stone-100" />
                    <div className="absolute top-8 left-12 right-12 bottom-0 bg-white/80 rounded-3xl shadow-sm border border-stone-50" />
                 </div>

                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div 
                        key={activeId}
                        initial={{ opacity: 0, scale: 0.9, rotate: -8, x: -60 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotate: 8, x: 60 }}
                        transition={{ 
                            duration: 0.7,
                            ease: [0.32, 0.72, 0, 1],
                        }}
                        style={{ transformOrigin: "bottom center" }}
                        className="absolute inset-0 w-full h-full z-10"
                    >
                         {/* Card Container */}
                        <div className="w-full h-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col justify-between ring-1 ring-black/5">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                    {activeId === "read-aloud" && <BookOpen className="w-5 h-5 text-violet-600" />}
                                    {activeId === "shadowing" && <RotateCw className="w-5 h-5 text-violet-600" />}
                                    {activeId === "listening" && <Mic className="w-5 h-5 text-violet-600" />}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
                                    {activeMode.title}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="h-full"
                                >
                                    {activeMode.content}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
             </div>

          </div>
        </div>
      </div>
    </section>
  );
});
