"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { createPersonalNote } from "../controller";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateNoteModal({ isOpen, onClose, onSuccess }: CreateNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPersonalNote(title, content);

      if (result.success) {
        setTitle("");
        setContent("");
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to create note");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle("");
      setContent("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900">Create Note</h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title Input */}
          <div>
            <label htmlFor="note-title" className="block text-xs font-medium text-stone-600 mb-1.5">
              Title
            </label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              disabled={isLoading}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1b5f4a]/20 focus:border-[#1b5f4a] transition-colors disabled:opacity-50"
              autoFocus
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="note-content" className="block text-xs font-medium text-stone-600 mb-1.5">
              Content
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              disabled={isLoading}
              rows={6}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1b5f4a]/20 focus:border-[#1b5f4a] transition-colors resize-none disabled:opacity-50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1b5f4a] hover:bg-[#164a3a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
