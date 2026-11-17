import React, { useState, useCallback } from "react";
import { Copy, Check, Sparkles, Waves, GraduationCap, Briefcase, MessageSquareQuote, Zap, BookOpen, Volume2, Pause } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { MessageContent } from "./MessageContent";
import { type ChatMode, getChatModeConfig } from "../procedure/chat-modes";
import { useFeedback } from "@/features/feedback/hooks/useFeedback";
import { useTTS } from "@/features/ai-interaction/presentation/hooks/useTTS";

// Map icon names to Lucide components
const MODE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Waves,
  GraduationCap,
  Briefcase,
  MessageSquareQuote,
  Zap,
  BookOpen,
};

interface Source {
  id: string;
  title: string;
  type: "youtube" | "text" | "pdf";
}

interface FlashcardVocab {
  word: string;
  meaning: string;
}

interface ChatMessageProps {
  role: "ai" | "user";
  content: string;
  sources?: Source[];
  userImage?: string;
  copiedIndex: number | null;
  messageIndex: number;
  onCopy: (text: string, index: number) => void;
  feedbackId?: string;
  onSaveFeedbackToNotes?: (feedbackId: string, feedbackText: string, userMessage: string) => void;
  flashcardVocabulary?: FlashcardVocab[]; // Vocabulary to highlight
  chatMode?: ChatMode; // AI conversation mode used
}

export const ChatMessage = React.memo(function ChatMessage({
  role,
  content,
  sources,
  userImage,
  copiedIndex,
  messageIndex,
  onCopy,
  feedbackId,
  onSaveFeedbackToNotes,
  flashcardVocabulary = [],
  chatMode,
}: ChatMessageProps) {
  const [showSourcesPopover, setShowSourcesPopover] = useState(false);
  const [showFeedbackPopover, setShowFeedbackPopover] = useState(false);
  const [isSavingToNotes, setIsSavingToNotes] = useState(false);

  // TTS Hook
  const { isSpeaking, speak, stop } = useTTS();

  // Fetch feedback using TanStack Query
  const { data: feedbackData, isLoading: isLoadingFeedback } = useFeedback(
    showFeedbackPopover && feedbackId ? feedbackId : undefined
  );
  
  const feedback = feedbackData?.feedbackText || null;

  // Memoize sources to prevent unnecessary re-renders
  const memoizedSources = React.useMemo(() => sources, [sources]);

  const handleOpenFeedbackPopover = useCallback((open: boolean) => {
    setShowFeedbackPopover(open);
  }, []);

  const handleSaveFeedback = async () => {
    if (feedback && feedbackId && onSaveFeedbackToNotes) {
      setIsSavingToNotes(true);
      try {
        await onSaveFeedbackToNotes(feedbackId, feedback, content);
        setShowFeedbackPopover(false);
      } catch (error) {
        console.error("Failed to save feedback to notes:");
      } finally {
        setIsSavingToNotes(false);
      }
    }
  };

  // Helper to clean markdown for TTS
  const handleTTS = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      // Clean content to remove markdown syntax for smoother speech
      const textToSpeak = content
            .replace(/```[\s\S]*?```/g, "") // Remove code blocks entirely
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/__ /g, "")
            .replace(/_/g, "")
            .replace(/#+/g, "")
            .replace(/`/g, "")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links: [text](url) -> text
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Images
            .replace(/\n+/g, ". "); // Newlines to pauses

      speak(textToSpeak);
    }
  }, [isSpeaking, stop, speak, content]);

  return (
    <div
      className={`flex flex-col gap-1.5 ${
        role === "user" ? "ml-auto items-end max-w-[70%]" : "items-start w-full"
      }`}
    >
      {/* Avatar (Top) - Only for USER */}
      {role === "user" && (
        <div className="shrink-0 px-2">
          <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#FFF085] to-[#C4B4FF] flex items-center justify-center overflow-hidden">
            {userImage ? (
              <Image
                src={userImage}
                alt="User"
                className="w-full h-full object-cover"
                width={16}
                height={16}
              />
            ) : (
              <span className="text-[10px] font-semibold text-white">U</span>
            )}
          </div>
        </div>
      )}

      {/* Message Content - AI uses full width with px, USER has bubble */}
      <div
        className={`${
          role === "ai"
            ? "text-stone-700 px-4 w-full"
            : "bg-[#defcc870] rounded-tr-none text-[#1b5f4a] p-4 mx-8 rounded-3xl"
        } text-sm leading-relaxed`}
      >
        {role === "ai" ? (
          <MessageContent
            content={content}
            flashcardVocabulary={flashcardVocabulary}
          />
        ) : (
          content
        )}
      </div>

      {/* Meta Row: Copy | Sources | Feedback (Bottom) */}
      <div
        className={`flex items-center gap-2 ${
          role === "user" ? "flex-row-reverse px-8" : "flex-row px-4"
        }`}
      >
        {/* Copy Button */}
        <button
          onClick={() => onCopy(content, messageIndex)}
          className="flex items-center justify-center w-6 h-6 text-stone-400 hover:text-stone-600 transition-colors rounded-[6px] hover:bg-stone-100"
          title="Copy message"
        >
          {copiedIndex === messageIndex ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* TTS Button (Only for AI messages) */}
        {role === "ai" && (
          <button
            onClick={handleTTS}
            className={`flex items-center justify-center w-6 h-6 transition-colors rounded-[6px] hover:bg-stone-100 ${
              isSpeaking ? "text-[#1b5f4a] bg-[#defcc870]" : "text-stone-400 hover:text-stone-600"
            }`}
            title={isSpeaking ? "Stop reading" : "Read aloud"}
          >
            {isSpeaking ? (
              <Pause className="w-2.5 h-2.5 fill-[#1b5f4a]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* AI Mode Badge (Only for AI messages with chatMode) - FIRST */}
        {role === "ai" && chatMode && (() => {
          const modeConfig = getChatModeConfig(chatMode);
          const ModeIcon = MODE_ICON_MAP[modeConfig.icon];
          
          return ModeIcon ? (
            <div 
              className="p-1 rounded-full bg-[#1b5f4a]"
              title={`${modeConfig.name} mode`}
            >
              <ModeIcon className="w-2.5 h-2.5 text-[#defcc8]" />
            </div>
          ) : null;
        })()}

        {/* Sources - SECOND */}
        {memoizedSources && memoizedSources.length > 0 && (
          <Popover open={showSourcesPopover} onOpenChange={setShowSourcesPopover}>
            <PopoverTrigger asChild>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer">
                {/* Stacked Images */}
                <div className="flex items-center -space-x-1.5">
                  {memoizedSources.slice(0, 3).map((source, sourceIdx) => (
                    <div
                      key={sourceIdx}
                      className="relative w-3.5 h-3.5 rounded-full bg-white border border-stone-200 overflow-hidden"
                      style={{ zIndex: memoizedSources.length - sourceIdx }}
                    >
                      <Image
                        src={
                          source.type === "youtube"
                            ? `https://www.google.com/s2/favicons?sz=64&domain_url=youtube.com`
                            : "/logos/notelab-main.png"
                        }
                        alt="source"
                        width={14}
                        height={14}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-stone-600 font-medium">
                  {memoizedSources.length === 1 ? memoizedSources[0].title.slice(0, 15) + (memoizedSources[0].title.length > 15 ? '...' : '') : `+${memoizedSources.length}`}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-52 p-2 bg-white/10 backdrop-blur-md border-0 shadow-sm rounded-lg"
              align={role === "user" ? "end" : "start"}
              side={role === "user" ? "top" : "bottom"}
              sideOffset={8}
            >
              <div className="space-y-1">
                {memoizedSources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                  >
                    <Image
                      src={
                        source.type === "youtube"
                          ? `https://www.google.com/s2/favicons?sz=64&domain_url=youtube.com`
                          : "/logos/notelab-main.png"
                      }
                      alt="source"
                      width={12}
                      height={12}
                      className="shrink-0"
                    />
                    <span className="text-[10px] text-stone-900 font-medium truncate">
                      {source.title}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Feedback Icon (Only for user messages with feedbackId) */}
        {role === "user" && feedbackId && (
          <Popover open={showFeedbackPopover} onOpenChange={handleOpenFeedbackPopover}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center justify-center w-5 h-5 bg-[#1b5f4a] text-[#defcc8] hover:text-[#1b5f4a] transition-colors rounded-[6px] hover:bg-[#dfecc8]"
                title="View English feedback"
              >
                <Sparkles className="w-2.5 h-2.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-0 bg-white/10 backdrop-blur-sm border border-violet-100 shadow-lg rounded-xl overflow-hidden"
              align="end"
              side="bottom"
              sideOffset={8}
              alignOffset={-20}
              collisionPadding={20}
            >
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1b5f4a] fill-[#1b5f4a]" />
                    <h4 className="text-sm font-semibold text-stone-900">English Feedback</h4>
                  </div>

                  {isLoadingFeedback ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-[#1b5f4a] border-t-[#defcc8] rounded-full animate-spin" />
                    </div>
                  ) : feedback ? (
                    <>
                      <div className="text-xs text-stone-700 leading-relaxed prose prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {feedback}
                        </ReactMarkdown>
                      </div>
                      <button
                        onClick={handleSaveFeedback}
                        disabled={isSavingToNotes}
                        className="w-full px-3 py-1.5 bg-[#1b5f4a] text-[#defcc8] text-xs font-medium rounded-md hover:bg-[#defcc870] hover:text-[#1b5f4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingToNotes ? 'Saving...' : 'Save to Notes'}
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-stone-500">Unable to load feedback.</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
});
