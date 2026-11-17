import React, { useEffect, useRef, useState, useCallback } from "react";
import { FeedbackSummaryModal } from "@/features/chat/presentation/FeedbackSummaryModal";
import { Book, Search } from "lucide-react";
import { useTextSelection } from "@/core/hooks/use-text-selection";
import { TextHighlightPopover } from "./TextHighlightPopover";
import { FlashcardsTab } from "@/features/flashcards/presentation";
import { ReadAloudTab } from "@/features/read-aloud/presentation";
import { NotesTab } from "@/features/notes/presentation";
import { ChatMessage, ChatHeader, ChatInput, ChatLoadingShimmer, ChatEmptyState } from "@/features/chat/presentation";
import type { ChatMessage as ChatMessageType, ChatConversation } from "@/features/chat/procedure";
import { saveHighlightNote } from "@/features/notes/controller";
import { markFeedbackSaved } from "@/features/feedback/controller";
import { useFlashcards } from "@/features/flashcards/hooks/useFlashcards";
import { buildFlashcardVocabulary } from "@/features/chat/procedure/vocabulary-parser";
import { useUIStore } from "@/core/store/ui-store";

interface TranscriptSidebarProps {
  isListening: boolean;
  transcript: string;
  messages: ChatMessageType[];
  selectedSkillName: string;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSendChatMessage?: (message: string, selectedVideoIds?: string[], isQuizMode?: boolean, chatMode?: string) => void;
  isChatProcessing?: boolean;
  userImage?: string; // Google profile photo
  onNewChat?: () => void; // Handler for new chat button
  savedChats?: ChatConversation[]; // List of saved chat conversations
  currentChatId?: string; // Current chat ID
  currentChatTitle?: string; // Current chat title
  onChatSelect?: (chatId: string) => void; // Handler for selecting a chat
  onDeleteChat?: (chatId: string) => void; // Handler for deleting a chat
  onFeedbackGenerated?: (messageIndex: number, feedbackId: string) => void;
  isMobile?: boolean; // Mobile layout mode
}

export type TabId = "chat" | "readAloud" | "flashcards" | "dictionary" | "notes";

export function TranscriptSidebar({
  messages,
  activeTab,
  onSendChatMessage,
  isChatProcessing = false,
  userImage,
  onNewChat,
  savedChats = [],
  currentChatId,
  currentChatTitle = "New Chat",
  onChatSelect,
  onDeleteChat,
  onFeedbackGenerated,
  isMobile = false,
}: TranscriptSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const { isFeedbackSummaryOpen, setFeedbackSummaryOpen } = useUIStore();
  const { flashcards } = useFlashcards();
  
  // Memoize vocabulary (Derived State) - Prevents infinite loops and useEffect usage
  const flashcardVocabulary = React.useMemo(() => {
    return flashcards ? buildFlashcardVocabulary(flashcards) : [];
  }, [flashcards]);

  // Text selection for learning
  const { selectedText, isOpen, handleClose } = useTextSelection(containerRef);

  // Removed useEffect for loading flashcards

  // Auto-scroll for chat
  useEffect(() => {
    if (activeTab === "chat" && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, activeTab]); // Use messages.length instead of messages array

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleToggleChatDropdown = useCallback((open: boolean) => {
    setIsChatDropdownOpen(open);
  }, []);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      onChatSelect?.(chatId);
      setIsChatDropdownOpen(false);
    },
    [onChatSelect]
  );

  const handleSaveFeedbackToNotes = useCallback(async (feedbackId: string, feedbackText: string, userMessage: string) => {
    try {
      // Import the server action dynamically
      const { saveFeedbackNoteFromText } = await import('@/features/notes/controller');

      // Save feedback as a FEEDBACK category note
      const result = await saveFeedbackNoteFromText(
        feedbackText,
        userMessage,
        undefined // sourceId - can be added later if needed
      );

      if (result.success) {
        // Mark feedback as saved in the feedback table
        await markFeedbackSaved(feedbackId);
        void 0;
      } else {
        console.error("Failed to save feedback:");
      }
    } catch (error) {
      console.error("Error saving feedback:");
    }
  }, []);

  const handleSaveHighlightNote = useCallback(async (text: string) => {
    try {
      const result = await saveHighlightNote(
        text,
        "", // context - empty for now
        "other", // sourceType
        undefined, // sourceId
        undefined // timestamp
      );
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error("Error saving highlight note:");
      return { success: false, error: "Failed to save note" };
    }
  }, []);

  // Container classes based on mobile mode
  const containerClasses = isMobile
    ? "w-full h-full flex flex-col bg-white overflow-hidden relative"
    : "w-full h-full flex flex-col bg-white rounded-4xl overflow-hidden border border-stone-100 shadow-sm relative";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden relative">

          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div data-tour="chat-tab" className="absolute inset-0 flex flex-col">
              {/* Header with Chat Switcher */}
              <ChatHeader
                currentChatId={currentChatId}
                currentChatTitle={currentChatTitle}
                savedChats={savedChats}
                hasMessages={messages.length > 0}
                isChatDropdownOpen={isChatDropdownOpen}
                onToggleDropdown={handleToggleChatDropdown}
                onSelectChat={handleSelectChat}
                onDeleteChat={onDeleteChat}
                onNewChat={onNewChat}
                onShowFeedbackSummary={() => setFeedbackSummaryOpen(true)}
              />

              {/* Content Area with Fade Effect - EXACTLY like PracticePlayer */}
              <div className="relative flex-1 overflow-hidden">
                {/* Top fade gradient */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white to-transparent pointer-events-none z-10" />

                {/* Scrollable messages */}
                <div className="overflow-y-auto scrollbar-hide h-full absolute inset-0 space-y-6 pt-4">
                  {/* Empty State */}
                  {messages.length === 0 && !isChatProcessing && (
                    <ChatEmptyState />
                  )}

                  {/* Messages */}
                  {messages.map((msg, i) => (
                    <ChatMessage
                      key={i}
                      role={msg.role}
                      content={msg.content}
                      sources={msg.sources}
                      userImage={userImage}
                      copiedIndex={copiedIndex}
                      messageIndex={i}
                      onCopy={handleCopy}
                      feedbackId={msg.feedbackId}
                      onSaveFeedbackToNotes={handleSaveFeedbackToNotes}
                      flashcardVocabulary={flashcardVocabulary}
                      chatMode={msg.chatMode}
                    />
                  ))}

                  {/* AI Loading Shimmer */}
                  {isChatProcessing && <ChatLoadingShimmer />}

                  {/* Voice Transcript - REMOVED: This should not appear in Chat tab */}
                  {/* Interview transcripts are separate and saved to Notes tab */}
                  <div ref={scrollRef} />
                </div>
              </div>

              {/* Chat Input at Bottom */}
              {onSendChatMessage && (
                <ChatInput
                  onSendMessage={onSendChatMessage}
                  isProcessing={isChatProcessing}
                  placeholder="Type a message..."
                />
              )}
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === "flashcards" && (
            <div className="absolute inset-0 overflow-hidden">
              <FlashcardsTab />
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="absolute inset-0">
              <NotesTab />
            </div>
          )}



          {/* DICTIONARY TAB (Placeholder) */}
          {activeTab === "dictionary" && (
            <div className="absolute inset-0 flex flex-col p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search definition..." 
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 transition-all"
                />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Book className="w-12 h-12 text-stone-300 mb-3" />
                <p className="text-sm text-stone-400">Search for a word to see its definition</p>
              </div>
            </div>
          )}

          {/* READ ALOUD TAB */}
          {activeTab === "readAloud" && (
            <div className="absolute inset-0">
              <ReadAloudTab />
            </div>
          )}

      </div>
      
      {/* Text Highlight Popover - Centered Overlay */}
      {isOpen && (
        <TextHighlightPopover
          key={selectedText}
          selectedText={selectedText}
          onClose={handleClose}
          onAskAbout={onSendChatMessage}
          onSaveNote={handleSaveHighlightNote}
        />
      )}

      {/* Feedback Summary Modal */}
      <FeedbackSummaryModal 
        isOpen={isFeedbackSummaryOpen} 
        onClose={() => setFeedbackSummaryOpen(false)} 
        chatId={currentChatId}
        messages={messages}
      />
    </div>
  );
}
