"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import { VocabularyWord } from "./VocabularyWord";
import { parseVocabularyInText } from "../procedure/vocabulary-parser";

interface MessageContentProps {
  content: string;
  flashcardVocabulary?: Array<{ word: string; meaning: string }>;
}

/**
 * Renders message content with interactive vocabulary words
 * Parses markdown and highlights flashcard vocabulary
 */
export const MessageContent = memo(function MessageContent({
  content,
  flashcardVocabulary = [],
}: MessageContentProps) {
  // If no flashcards, just render markdown normally
  if (flashcardVocabulary.length === 0) {
    return (
      <div className="text-[#374151] text-[14px] leading-[1.75] max-w-[70ch]">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
            h1: ({ children }) => (
              <h1 className="text-[17px] font-bold text-[#111827] mb-4 mt-8 first:mt-0 pb-2 border-b border-gray-200">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-[15px] font-semibold text-[#111827] mb-3 mt-7 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-[14px] font-semibold text-[#111827] mb-2 mt-5 first:mt-0">
                {children}
              </h3>
            ),
            ul: ({ children }) => <ul className="mb-5 last:mb-0 list-disc pl-6 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="mb-5 last:mb-0 list-decimal pl-6 space-y-2">{children}</ol>,
            li: ({ children }) => <li className="pl-1 leading-[1.6]">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-[#111827]">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-5 text-gray-600 italic bg-gray-50 rounded-r-lg">
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <code className="block bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg text-[13px] font-mono overflow-x-auto my-5 leading-normal">
                    {children}
                  </code>
                );
              }
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 text-[#d63384] rounded text-[13px] font-mono">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <pre className="bg-[#1e1e1e] rounded-lg overflow-hidden my-5">{children}</pre>,
            a: ({ children, href }) => (
              <a href={href} className="text-[#2563eb] hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            hr: () => <hr className="my-8 border-gray-200" />,
            table: ({ children }) => (
              <div className="overflow-x-auto my-5 rounded-lg border border-gray-200">
                <table className="min-w-full text-[13px]">{children}</table>
              </div>
            ),
            th: ({ children }) => <th className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-left font-semibold text-[#111827]">{children}</th>,
            td: ({ children }) => <td className="border-b border-gray-100 px-4 py-2.5">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Parse content to identify vocabulary
  const segments = parseVocabularyInText(content, flashcardVocabulary);

  // Render with vocabulary highlighting
  return (
    <div className="text-[#374151] text-[14px] leading-[1.75] max-w-[70ch]">
      {segments.map((segment, index) => {
        if (segment.type === "vocab" && segment.meaning) {
          return (
            <VocabularyWord
              key={index}
              word={segment.content}
              meaning={segment.meaning}
            />
          );
        }
        
        // For text segments, render as markdown
        return (
          <span key={index} className="inline">
            <ReactMarkdown
              components={{
                p: ({ children }) => <span>{children}</span>,
                strong: ({ children }) => <strong className="font-semibold text-[#111827]">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 bg-gray-100 text-[#d63384] rounded text-[13px] font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {segment.content}
            </ReactMarkdown>
          </span>
        );
      })}
    </div>
  );
});
