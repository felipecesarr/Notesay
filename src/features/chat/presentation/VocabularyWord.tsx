"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";

interface VocabularyWordProps {
  word: string;
  meaning: string;
}

/**
 * Interactive vocabulary word with hover popover
 * Shows flashcard meaning - uses Radix Popover for proper collision detection
 */
export function VocabularyWord({ word, meaning }: VocabularyWordProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative inline-block border-b border-transparent cursor-none text-stone-900 hover:text-[#1b5f4a] hover:bg-[#e4f4c7] hover:border-transparent px-1 rounded-sm transition-colors duration-200 font-bold whitespace-nowrap"
        >
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[220px] p-0 bg-[#eaf0de] backdrop-blur-md border-0 rounded-lg shadow-none pointer-events-none"
        side="top"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions={true}
      >
        <div className="px-3 py-2">
          <p className="text-[12px] text-[#1b5f4a] font-medium leading-snug">
            {meaning}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
