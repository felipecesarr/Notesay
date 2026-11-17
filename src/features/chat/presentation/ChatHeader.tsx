import React from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { ChatSwitcherPopover } from "./ChatSwitcherPopover";

interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatHeaderProps {
  currentChatId?: string;
  currentChatTitle: string;
  savedChats: ChatConversation[];
  hasMessages: boolean;
  isChatDropdownOpen: boolean;
  onToggleDropdown: (open: boolean) => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onNewChat?: (saveCurrentChat: boolean) => void;
  onShowFeedbackSummary?: () => void;
}

export const ChatHeader = React.memo(function ChatHeader({
  currentChatId,
  currentChatTitle,
  savedChats,
  hasMessages,
  isChatDropdownOpen,
  onToggleDropdown,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onShowFeedbackSummary,
}: ChatHeaderProps) {
  // Check if current chat is already saved
  const isCurrentChatSaved = currentChatId ? savedChats.some(chat => chat.id === currentChatId) : false;
  
  // Has unsaved changes if there are messages and chat is not saved
  const hasUnsavedChanges = hasMessages && !isCurrentChatSaved;

  return (
    <div className="px-6 pt-4 pb-2 flex items-center justify-between shrink-0 bg-white/10 backdrop-blur-sm">
      {/* Chat Switcher - Left */}
      <ChatSwitcherPopover
        chats={savedChats}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
        onNewChat={onNewChat}
        hasUnsavedChanges={hasUnsavedChanges}
        open={isChatDropdownOpen}
        onOpenChange={onToggleDropdown}
        currentChatId={currentChatId}
      >
        <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-700 hover:text-stone-900 hover:bg-stone-200/30 rounded-sm transition-colors">
          <span className="max-w-[180px] truncate font-medium">
            {currentChatTitle}
          </span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </ChatSwitcherPopover>

      {/* Feedback Summary - Right */}
      <button
        onClick={onShowFeedbackSummary}
        className="p-1.5 hover:bg-stone-100 rounded-sm transition-colors text-stone-400 hover:text-stone-600"
        title="Review"
      >
        <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
});
