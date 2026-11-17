"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Trash2,
  Search,
  X,
  Check,
  Copy,
  Plus,
} from "lucide-react";
import { deleteNote, type Note, type NoteCategory } from "../controller"; // Removed getNotes
import { useNotes } from "../hooks/useNotes";
import { QuizFeedback } from "@/features/quiz/presentation";
import { parseFeedbackNote } from "../procedure";
import { NotesEmptyState } from "./NotesEmptyState";
import { CreateNoteModal } from "./CreateNoteModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function NotesTab() {
  const { notes, isLoading, refetchNotes } = useNotes();
  // const [notes, setNotes] = useState<Note[]>([]); // Removed
  /* Removed filteredNotes state */
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  // const [isLoading, setIsLoading] = useState(true); // Removed
  const [selectedFeedback, setSelectedFeedback] = useState<ReturnType<typeof parseFeedbackNote> | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // Track which note is being deleted
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Removed loadNotes effect

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by category
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notes, selectedCategory, searchQuery]);

  const handleDeleteNote = async (id: string) => {
    const result = await deleteNote(id);
    if (result.success) {
      await refetchNotes();
      // setNotes((prev) => prev.filter((note) => note.id !== id)); // Handled by refetch
      if (selectedNote?.id === id) setSelectedNote(null);
      setDeleteConfirmId(null); // Close confirmation
    }
  };

  const handleViewFeedback = (note: Note) => {
    const feedback = parseFeedbackNote(note);
    if (feedback) {
      // Interview feedback - use QuizFeedback modal
      setSelectedFeedback(feedback);
    } else {
      // Language feedback - show in note modal
      setSelectedNote(note);
    }
  };

  const getCategoryStyle = (category: NoteCategory) => {
    switch (category) {
      case "HIGHLIGHT":
        return "bg-[#defcc870] text-[#1b5f4a]";
      case "TRANSCRIPT":
        return "bg-[#defcc870] text-[#1b5f4a]";
      case "FEEDBACK":
        return "bg-[#defcc870] text-[#1b5f4a]";
      case "CHAT":
        return "bg-[#defcc870] text-[#1b5f4a]";
      case "PERSONAL":
        return "bg-[#C4B4FF40] text-[#5B3FC0]";
      default:
        return "bg-[#defcc870] text-[#1b5f4a]";
    }
  };

  const getCategoryLabel = (category: NoteCategory) => {
    switch (category) {
      case "HIGHLIGHT": return "Note";
      case "TRANSCRIPT": return "Transcript";
      case "FEEDBACK": return "Feedback";
      case "CHAT": return "Chat";
      case "PERSONAL": return "Personal";
      default: return category;
    }
  };

  return (
    <div data-tour="notes-tab" className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="px-4 py-5 flex items-center justify-between shrink-0">
        <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">My Notes</h2>
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-stone-400 font-medium">
            {filteredNotes.length} items
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1.5 bg-[#1b5f4a] hover:bg-[#164a3a] text-white rounded-lg transition-colors"
            title="Create new note"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 pb-2 space-y-3">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 hover:bg-stone-100 focus:bg-white border border-transparent focus:border-stone-200 rounded-md text-xs focus:outline-none focus:ring-0 transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-2">
          {["ALL", "PERSONAL", "HIGHLIGHT", "TRANSCRIPT", "FEEDBACK", "CHAT"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as NoteCategory | "ALL")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#1b5f4a] text-[#dfecc8]"
                  : "bg-white border border-stone-100 text-stone-400 hover:text-stone-500 "
              }`}
            >
              {cat === "ALL" ? "All" : getCategoryLabel(cat as NoteCategory)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          searchQuery ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
              <FileText className="w-8 h-8 text-stone-300 mb-2" />
              <p className="text-xs text-stone-500">No matches found</p>
            </div>
          ) : (
            <NotesEmptyState />
          )
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="bg-stone-50 p-3 rounded-md hover:bg-stone-100 transition-colors relative group cursor-pointer"
                  onClick={() => {
                    if (note.category === "FEEDBACK") {
                      handleViewFeedback(note);
                    } else {
                      setSelectedNote(note);
                    }
                  }}
                >
                  <div className="flex flex-col gap-1.5">
                    {/* Header: Title & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {note.title}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-medium uppercase tracking-wide shrink-0 ${getCategoryStyle(note.category)}`}>
                        {getCategoryLabel(note.category)}
                      </span>
                    </div>

                    {/* Content Preview */}
                    <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">
                      {note.category === "FEEDBACK"
                        ? parseFeedbackNote(note)?.overallPerformance || "View feedback details"
                        : note.category === "CHAT"
                        ? (() => {
                            try {
                              const messages = JSON.parse(note.content);
                              const lastUserMsg = messages.filter((m: { role: string; content: string }) => m.role === "user").pop();
                              return lastUserMsg?.content || "Chat conversation";
                            } catch {
                              return "Chat conversation";
                            }
                          })()
                        : note.content}
                    </p>

                    {/* Footer: Date */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-stone-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Delete Action (Hover) */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {deleteConfirmId === note.id ? (
                      // Delete confirmation - inline style
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-50/80 backdrop-blur-sm rounded-md">
                        <span className="text-[9px] font-medium text-red-700 mr-0.5">
                          Delete?
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          title="Confirm delete"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="p-1 hover:bg-stone-100 rounded text-stone-500 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(note.id);
                        }}
                        className="p-1.5 hover:bg-stone-200 rounded-md text-stone-400 hover:text-red-500 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Generic Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/40 backdrop-blur-md rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-stone-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                   <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-medium uppercase tracking-wide ${getCategoryStyle(selectedNote.category)}`}>
                      {getCategoryLabel(selectedNote.category)}
                   </span>
                   <span className="text-xs text-stone-400">
                      {new Date(selectedNote.createdAt).toLocaleDateString()}
                   </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      if (selectedNote) {
                        navigator.clipboard.writeText(selectedNote.content);
                        // Optional: Show toast or feedback
                      }
                    }} 
                    className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
                    title="Copy content"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedNote(null)} 
                    className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto scrollbar-hide">
                 <h3 className="text-lg font-semibold text-stone-900 mb-4">{selectedNote.title}</h3>
                 {selectedNote.category === "CHAT" ? (
                   <div className="space-y-3">
                     {(() => {
                       try {
                         const messages = JSON.parse(selectedNote.content);
                         return messages.map((msg: { role: string; content: string; sources?: { title: string }[] }, idx: number) => (
                           <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                             <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                               msg.role === "user"
                                 ? "bg-[#defcc870] text-[#1b5f4a]"
                                 : "bg-stone-100 text-stone-900"
                             }`}>
                               <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                               {msg.sources && msg.sources.length > 0 && (
                                 <div className="mt-1 pt-1 border-t border-current/10">
                                   <p className="text-[10px] opacity-70">
                                     Sources: {msg.sources.map((s) => s.title).join(", ")}
                                   </p>
                                 </div>
                               )}
                             </div>
                           </div>
                         ));
                       } catch {
                         return <p className="text-sm text-stone-600">Failed to load conversation</p>;
                       }
                     })()}
                   </div>
                 ) : selectedNote.category === "FEEDBACK" ? (
                   <div className="prose prose-sm max-w-none prose-stone">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {selectedNote.content}
                     </ReactMarkdown>
                   </div>
                 ) : (
                   <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                     {selectedNote.content}
                   </p>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <QuizFeedback
            feedback={selectedFeedback}
            onClose={() => setSelectedFeedback(null)}
          />
        )}
      </AnimatePresence>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetchNotes}
      />
    </div>
  );
}
