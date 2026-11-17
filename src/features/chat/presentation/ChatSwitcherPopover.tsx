"use client";

import React, { useState } from "react";
import { MessageCircle, Trash2, X, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";

interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatSwitcherPopoverProps {
  children: React.ReactNode;
  chats: ChatConversation[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onNewChat?: (saveCurrentChat: boolean) => void;
  hasUnsavedChanges?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatSwitcherPopover({
  children,
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  open,
  onOpenChange,
}: ChatSwitcherPopoverProps & { currentChatId?: string }) {
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId);
    onOpenChange(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setDeletingChatId(chatId);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (onDeleteChat) {
      await onDeleteChat(chatId);
    }
    setDeletingChatId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChatId(null);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 bg-white/20 backdrop-blur-md border-0 shadow-sm ring-1 ring-black/5 rounded-xl overflow-hidden"
        align="start"
        side="bottom"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* New Chat Action */}
        {onNewChat && (
            <div className="p-1 pb-1 border-b border-stone-100 mb-1">
                <button 
                    onClick={() => {
                        onNewChat(true);
                        onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-stone-300/20 transition-colors text-left group"
                >
                    <div className="w-5 h-5 flex items-center justify-center bg-stone-100/20 rounded-md transition-all">
                        <Plus className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900" />
                    </div>
                    <span className="text-xs font-medium text-stone-600 group-hover:text-stone-900">
                        New Chat
                    </span>
                </button>
            </div>
        )}

        {/* Chat List */}
        <div className="max-h-80 overflow-y-auto scrollbar-hide">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageCircle className="w-8 h-8 text-stone-300 mb-3" />
              <p className="text-xs text-stone-400 text-center">
                No saved chats yet
              </p>
            </div>
          ) : (
            <div className="p-1 space-y-1">
              {chats.map((chat) => (
                <div key={chat.id} className="relative group">
                  {deletingChatId === chat.id ? (
                    // Delete Confirmation
                    <div className="w-full flex items-center gap-2 p-2 rounded-md bg-rose-50 text-rose-900">
                      <p className="flex-1 text-[10px] font-medium">
                        Delete?
                      </p>
                      <button
                        onClick={(e) => handleConfirmDelete(e, chat.id)}
                        className="px-2 py-0.5 bg-rose-200 hover:bg-rose-300 rounded text-[10px] font-medium transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="p-0.5 text-rose-400 hover:text-rose-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    // Normal Chat Item
                    <button
                      onClick={() => handleSelectChat(chat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-1 rounded-lg transition-all text-left relative group/item ${
                        chat.id === currentChatId
                          ? "bg-stone-300/20 text-stone-900"
                          : "hover:bg-stone-300/20 text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <MessageCircle 
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          chat.id === currentChatId ? "text-stone-900" : "text-stone-400 group-hover/item:text-stone-600"
                        }`}
                        fill={chat.id === currentChatId ? "currentColor" : "none"} 
                      />
                      
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className={`text-[12px] truncate leading-tight ${
                          chat.id === currentChatId ? "font-semibold" : "font-medium"
                        }`}>
                          {chat.title}
                        </span>
                        <span className="text-[9px] text-stone-400 truncate mt-0.5">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Delete Button (Hover) */}
                      <div className="shrink-0 flex items-center justify-end w-6 h-6">
                        {onDeleteChat && (
                          <div
                            role="button"
                            onClick={(e) => handleDeleteClick(e, chat.id)}
                            className="hidden group-hover/item:flex p-1 hover:bg-rose-50 rounded text-stone-400 hover:text-rose-500 transition-colors"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
