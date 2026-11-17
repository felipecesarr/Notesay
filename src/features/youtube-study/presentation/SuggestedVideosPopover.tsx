"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";

interface SuggestedVideosPopoverProps {
  children: React.ReactNode;
  onSelectTopic: (topic: string) => void;
  isLoading: boolean;
}

const TOPICS = [
  "Sports",
  "Geek",
  "Pop",
  "Celebrities",
  "TV Shows",
  "Technology",
  "Music",
  "Gaming",
  "Movies",
  "Food",
  "Travel",
  "Fashion",
  "Science",
  "History",
  "Art",
  "Comedy",
  "News",
  "Business",
  "Fitness",
  "Health",
  "Education",
  "DIY",
  "Nature",
  "Cars",
  "Pets",
  "Books",
  "Photography",
  "Dance",
  "Cooking",
  "Space",
];

export function SuggestedVideosPopover({
  children,
  onSelectTopic,
  isLoading,
}: SuggestedVideosPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectTopic = (topic: string) => {
    onSelectTopic(topic);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-white/10 backdrop-blur-md border-0 shadow-xl rounded-2xl overflow-hidden"
        align="start"
        side="bottom"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Topics Grid */}
        <div className="p-4 h-72 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-[#1b5f4a] border-t-[#1b5f4a50] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSelectTopic(topic)}
                  className="px-3 py-2 bg-white/80 hover:bg-[#dfecc870] rounded-lg text-[10px] font-medium text-stone-900 transition-colors border border-stone-200/50 hover:border-[#dfecc870] hover:text-[#1b5f4a]"
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
