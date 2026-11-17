"use client";

import React from "react";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { Badge } from "@/core/components/ui/badge";
import { FileText } from "lucide-react";
import { formatTranscriptForDisplay } from "@/features/interview/procedure";

type TranscriptViewProps = {
  transcript: string;
  questions: string[];
  isListening?: boolean;
};

/**
 * PRESENTATION LAYER
 * Display live transcript and conversation history
 */
export const TranscriptView = React.memo(
  ({ transcript, questions, isListening = false }: TranscriptViewProps) => {
    const displayTranscript = formatTranscriptForDisplay(transcript);
    const wordCount = transcript.split(/\s+/).filter((w) => w.length > 0).length;

    return (
      <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-xl border border-stone-200/50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-200/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-stone-600" />
            <h3 className="text-sm font-semibold text-stone-900">Transcript</h3>
          </div>
          <div className="flex items-center gap-2">
            {isListening && (
              <Badge className="bg-red-100 text-red-600 text-xs">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1.5" />
                Listening
              </Badge>
            )}
            <span className="text-xs text-stone-500">{wordCount} words</span>
          </div>
        </div>

        {/* Conversation History */}
        {questions.length > 0 && (
          <div className="px-4 py-3 border-b border-stone-200/50 space-y-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Questions Asked ({questions.length})
            </h4>
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={i} className="text-xs text-stone-600 flex gap-2">
                    <span className="font-medium text-purple-600">Q{i + 1}:</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Current Transcript */}
        <ScrollArea className="flex-1 px-4 py-3">
          {displayTranscript ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                {displayTranscript}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 max-w-xs">
                Start speaking and your words will appear here in real-time
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer Stats */}
        <div className="px-4 py-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-stone-500">
          <span>{questions.length} questions</span>
          <span>{wordCount} words spoken</span>
        </div>
      </div>
    );
  }
);

TranscriptView.displayName = "TranscriptView";
