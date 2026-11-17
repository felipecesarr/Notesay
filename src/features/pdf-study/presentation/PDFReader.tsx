"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { TextHighlightPopover } from "@/features/ai-interaction/presentation/TextHighlightPopover";
import { useTextSelection } from "@/core/hooks/use-text-selection";
import ReactMarkdown from "react-markdown";

// Mock save note for now if not passed
const mockSaveNote = async (text: string) => { void 0; return { success: true }; };

interface PDFReaderProps {
  study: {
    id: string;
    title: string;
    extractedContent: string;
  };
  initialPage?: number;
  onProgressChange?: (currentPage: number, totalPages: number) => void;
  onBack: () => void;
  onAskAbout?: (text: string) => void;
  onSaveNote?: (text: string) => Promise<{ success: boolean; error?: string }>;
}

export function PDFReader({ 
  study, 
  initialPage = 0, 
  onProgressChange, 
  onBack,
  onAskAbout,
  onSaveNote = mockSaveNote
}: PDFReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Text Selection for Popover
  const { 
    selectedText, 
    handleClose: handleSelectionClose 
  } = useTextSelection(containerRef);

  // Split content into pages
  const pages = useMemo(() => {
    return splitContentIntoPages(study.extractedContent);
  }, [study.extractedContent]);

  const totalPages = pages.length;


  // Store callback in ref to avoid dependency issues
  const onProgressChangeRef = React.useRef(onProgressChange);
  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  // Scroll to top only when page changes
  useEffect(() => {
    if (containerRef.current) {
        const scrollable = containerRef.current.querySelector('.overflow-y-auto');
        if (scrollable) scrollable.scrollTop = 0;
    }
  }, [currentPage]);

  // Report progress separately (doesn't trigger scroll)
  useEffect(() => {
    onProgressChangeRef.current?.(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full bg-white rounded-4xl border border-stone-200/50 shadow-sm overflow-hidden relative">
      {/* Scrollbar Style Injection */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
      
      {/* Header with Pagination */}
      <div className="px-6 py-3 border-none border-stone-100 flex items-center justify-between bg-white shrink-0 z-10 h-14">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
            <button 
                onClick={onBack}
                className="p-1.5 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-800 shrink-0"
            >
                <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-[10px] font-medium text-stone-500 leading-tight line-clamp-1 uppercase tracking-wide">
                {study.title}
            </h1>
        </div>

        {/* Right: Pagination Controls */}
        <div className="flex items-center gap-3 shrink-0">
             <span className="text-[10px] text-stone-400 font-normal uppercase tracking-wider tabular-nums">
                Page {currentPage + 1} / {totalPages}
            </span>
             
             <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    className="text-stone-400 hover:text-stone-600 hover:bg-transparent rounded-full w-7 h-7"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentPage === totalPages - 1}
                    className="text-stone-400 hover:text-stone-600 hover:bg-transparent rounded-full w-7 h-7"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </Button>
             </div>
        </div>
      </div>

      {/* Content Area - Scrollable, No Scrollbar, Max Width utilization */}
      <div className="flex-1 overflow-y-auto px-12 py-10 w-full scroll-smooth no-scrollbar">
         <div className="prose prose-stone prose-sm max-w-none w-full pb-20 font-sans text-stone-900 text-sm">
            <PageRenderer content={pages[currentPage]} />
         </div>
      </div>

      {/* AI Interaction Popover */}
      {selectedText && (
        <TextHighlightPopover
          key={selectedText}
          selectedText={selectedText}
          onClose={handleSelectionClose}
          onAskAbout={onAskAbout}
          onSaveNote={onSaveNote}
        />
      )}
    </div>
  );
}

// ----------------------------------------
// Logic & Subcomponents
// ----------------------------------------

function splitContentIntoPages(text: string, maxChars: number = 2000): string[] {
    // 1. Try to split by explicit Page Breaks from AI
    if (text.includes("<<<PAGE_BREAK>>>")) {
        return text
            .split("<<<PAGE_BREAK>>>")
            .map(p => p.trim())
            .filter(p => p.length > 0);
    }

    // 2. Fallback: Split by character count (legacy or simple text)
    const pages: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxChars) {
            pages.push(remaining.trim());
            break;
        }

        // Find best split point near maxChars
        let splitIndex = maxChars;
        const searchRange = Math.min(500, maxChars / 2); // Look back up to 500 chars

        // Priority 1: Paragraph break (\n\n)
        const paragraphMatch = remaining.lastIndexOf("\n\n", maxChars);
        if (paragraphMatch > maxChars - searchRange) {
            splitIndex = paragraphMatch;
        } else {
             // Priority 2: Sentence end (.!?)
             const sentenceMatch = findLastSentenceEnd(remaining, maxChars);
             if (sentenceMatch > maxChars - searchRange) {
                 splitIndex = sentenceMatch + 1; // Include the punctuation
             } else {
                 // Priority 3: Space
                 const spaceMatch = remaining.lastIndexOf(" ", maxChars);
                 if (spaceMatch > maxChars - searchRange) {
                     splitIndex = spaceMatch;
                 }
             }
        }

        pages.push(remaining.slice(0, splitIndex).trim());
        remaining = remaining.slice(splitIndex).trim();
    }

    return pages;
}

function findLastSentenceEnd(text: string, limit: number): number {
    const substring = text.slice(0, limit);
    // Regex for . ! ? followed by whitespace or end of string
    const match = substring.match(/([.!?])(?=\s)/g); // Removed complex regex for simplicity
    if (!match) return -1;
    
    return substring.lastIndexOf(match[match.length - 1]); // Simple last index
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const markdownComponents = {
    // Headers
    h1: ({node, ...props}: any) => <h2 className="text-lg font-bold text-stone-900 mt-8 mb-4 border-b border-stone-100 pb-2 uppercase tracking-tight" {...props} />,
    h2: ({node, ...props}: any) => <h3 className="text-md font-bold text-stone-900 mt-8 mb-3 uppercase tracking-wide" {...props} />,
    h3: ({node, ...props}: any) => <h4 className="text-base font-bold text-stone-900 mt-6 mb-2" {...props} />,
    
    // Paragraphs: Clean, readable, well-spaced
    p: ({node, ...props}: any) => <p className="text-sm leading-8 text-stone-500 mb-6 text-justify" {...props} />,
    
    // Lists: Proper indentation and bullets
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 space-y-2 mb-6 text-stone-900" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 space-y-2 mb-6 text-stone-900" {...props} />,
    li: ({node, ...props}: any) => <li className="pl-1 leading-8 text-stone-900" {...props} />,
    
    // Emphasis
    strong: ({node, ...props}: any) => <strong className="font-semibold text-stone-900" {...props} />,
    em: ({node, ...props}: any) => <em className="text-stone-900" {...props} />,
    
    // Blockquotes
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-stone-200 pl-4 italic text-stone-600 my-6" {...props} />,
    
    // Tables
    table: ({node, ...props}: any) => <table className="w-full border-collapse mb-6 text-sm" {...props} />,
    thead: ({node, ...props}: any) => <thead className="bg-stone-100" {...props} />,
    tbody: ({node, ...props}: any) => <tbody {...props} />,
    tr: ({node, ...props}: any) => <tr className="border-b border-stone-200" {...props} />,
    th: ({node, ...props}: any) => <th className="px-3 py-2 text-left font-semibold text-stone-900 text-xs uppercase tracking-wide" {...props} />,
    td: ({node, ...props}: any) => <td className="px-3 py-2 text-stone-600" {...props} />,
    
    // Code blocks - render as normal text, not monospace
    code: ({node, ...props}: any) => <span className="text-stone-700" {...props} />,
    pre: ({node, ...props}: any) => <div className="text-sm leading-8 text-stone-500 mb-6" {...props} />
};
/* eslint-enable @typescript-eslint/no-unused-vars */
/* eslint-enable @typescript-eslint/no-explicit-any */

// Renders the page text using robust Markdown parsing.
// This ensures consistent formatting for headers, lists, and paragraphs irrespective of varying AI output.
const PageRenderer = ({ content }: { content: string }) => {
    return (
        <div className="w-full h-full antialiased selection:bg-[#dfecc8] selection:text-[#1b5f4a] selection:rounded-full">
            <div className="max-w-3xl mx-auto pb-12 prose prose-stone">
                <ReactMarkdown components={markdownComponents}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

