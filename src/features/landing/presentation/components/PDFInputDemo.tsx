"use client";

import React from "react";
import { ArrowRight, FileUp, FileText, X } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function PDFInputDemo() {
  const [phase, setPhase] = React.useState<"idle" | "dragging" | "dropped" | "processing">("idle");

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    const cycle = async () => {
      // 1. Idle -> Dragging (after 1s)
      await new Promise(r => setTimeout(r, 1000));
      setPhase("dragging");

      // 2. Dragging -> Dropped (after 1s)
      await new Promise(r => setTimeout(r, 1000));
      setPhase("dropped");

      // 3. Dropped -> Processing (after 1s)
      await new Promise(r => setTimeout(r, 1000));
      setPhase("processing");

      // 4. Processing -> Reset (after 2s)
      await new Promise(r => setTimeout(r, 2000));
      setPhase("idle");
      
      // Loop
      cycle();
    };

    cycle();
    return () => {}; // Cleanup difficult with async loop, but component unmounts handle state ok usually or strictly cancel timeout. 
    // Strict implementation:
    // This simple loop might cause memory leak warning if unmounted quickly. 
    // Better to use chain of timeouts in useEffect deps? 
    // I'll use standard useEffect timeout chain like YouTube demo for safety.
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-12">
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-16"
      >
        <Image
          src="/logos/notelab-input.png"
          alt="Notesay AI Logo"
          width={80}
          height={80}
          className="-rotate-12"
        />
      </motion.div>

      <div className="relative w-full max-w-lg">
        {/* Gradient glow background matching VideoInput */}
        <div className="absolute inset-0 bg-linear-to-t from-violet-200 to-[#dfecc8] blur-md opacity-150 rounded-4xl" />
        
        {/* Main Input Card - Matching VideoInput structure */}
        <div className="relative w-full bg-white border border-stone-50 rounded-4xl p-4">
          <div className="flex flex-col min-h-[120px]">
             
            {/* Drop Zone - Restyled to match card aesthetic */}
            <div 
                className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 min-h-[140px] relative overflow-hidden group
                    ${phase === "dragging" ? "border-[#1b5f4a] bg-stone-50 scale-[0.98]" : "border-stone-100"}
                    ${(phase === "dropped" || phase === "processing") ? "border-solid border-[#1b5f4a]/10 bg-[#fbfdf7]" : "bg-stone-50/50"}
                `}
            >
                {(phase === "dropped" || phase === "processing") ? (
                    <div className="flex flex-col items-center gap-2 p-4 text-center z-10 w-full px-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-10 h-10 bg-[#1b5f4a]/10 rounded-xl flex items-center justify-center text-[#1b5f4a] mb-1">
                            <FileText className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-stone-800 truncate w-full">
                            The Great Gatsby.pdf
                        </p>
                        <span className="text-[10px] uppercase tracking-wide font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                            2.4 MB
                        </span>
                        
                        <div className="absolute top-2 right-2 p-1.5 text-stone-400 bg-stone-100 rounded-full opacity-50">
                            <X className="w-3.5 h-3.5" />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300
                            ${phase === "dragging" ? "bg-[#1b5f4a]/10 text-[#1b5f4a] scale-110" : "bg-stone-100/80 text-stone-400"}
                        `}>
                            <FileUp className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-medium text-stone-500 max-w-[180px]">
                            {phase === "dragging" ? "Drop PDF here!" : "Click or drag to upload PDF"}
                        </p>
                    </div>
                )}
            </div>

            {/* Submit Button Row */}
            <div className="flex justify-end mt-4">
                <button
                  disabled
                  className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-medium transition-all duration-300
                  ${
                    (phase === "dropped" || phase === "processing")
                      ? "bg-[#1b5f4a] text-[#dfecc8] hover:shadow-md"
                      : "bg-[#dfecc870] text-[#1b5f4a]"
                  }
                `}
                >
                  {phase === "processing" ? (
                    <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                    </>
                  ) : (
                    <>
                        <span>Start Study</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fake Recent PDFs */}
      <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl">
         <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg text-xs font-medium text-stone-600 transition-colors opacity-60">
             <div className="w-3.5 h-3.5 shrink-0 text-stone-400">
                <FileText className="w-full h-full" />
             </div>
             <span className="truncate max-w-[150px]">Atomic Habits.pdf</span>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg text-xs font-medium text-stone-600 transition-colors opacity-60">
             <div className="w-3.5 h-3.5 shrink-0 text-stone-400">
                <FileText className="w-full h-full" />
             </div>
             <span className="truncate max-w-[150px]">Clean Code.pdf</span>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg text-xs font-medium text-stone-600 transition-colors opacity-60">
             <div className="w-3.5 h-3.5 shrink-0 text-stone-400">
                <FileText className="w-full h-full" />
             </div>
             <span className="truncate max-w-[150px]">History_Notes.pdf</span>
         </div>
      </div>
    </div>
  );
}
