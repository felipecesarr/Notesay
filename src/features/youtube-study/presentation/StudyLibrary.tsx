"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Trash2, ChevronLeft, Check, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/core/components/ui/button";

export interface Study {
  id: string;
  title: string;
  thumbnail?: string | null;
  createdAt: Date;
  summary?: string | null;
}

interface StudyLibraryProps {
  studies: Study[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  type?: 'youtube' | 'pdf'; // Type of content to display correct icons
}

export function StudyLibrary({ studies, onSelect, onDelete, onAddNew, type = 'youtube' }: StudyLibraryProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // Track which item is being deleted
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const isPdf = type === 'pdf';

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-4xl overflow-hidden border border-stone-200/50 shadow-sm">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            onClick={onAddNew}
            size="sm"
            variant="ghost"
            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-stone-800 tracking-tight">
            Your Library
          </h2>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 scrollbar-hide">
        {studies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
              {isPdf ? (
                <FileText className="w-4 h-4 text-stone-300" />
              ) : (
                <Play className="w-4 h-4 text-stone-300" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-stone-700 mb-2">
              No {isPdf ? "PDFs" : "videos"} yet
            </h3>
            <p className="text-sm text-stone-400 max-w-xs">
              Add your first {isPdf ? "PDF document" : "YouTube video"} to start learning
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {studies.map((study) => (
              <div
                key={study.id}
                className="group cursor-pointer"
                onClick={() => onSelect(study.id)}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.04]">
                  
                  {/* Image or PDF Placeholder */}
                  {study.thumbnail && !study.thumbnail.includes("pdf-placeholder") ? (
                    <Image
                      src={study.thumbnail}
                      alt={study.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    // Fallback / PDF visual
                    // Fallback / PDF visual
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-violet-200 to-[#dfecc8] p-6">
                         {isPdf ? <FileText className="w-12 h-12 text-white" /> : <Play className="w-12 h-12 text-[#1b5f4a]/80" />}
                    </div>
                  )}

                  {/* Bottom Gradient with Title - Larger fade */}
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/40 via-black/10 to-transparent pt-20 pb-3 px-3 pointer-events-none">
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-lg">
                      {study.title}
                    </h3>
                  </div>

                  {/* Hover Darken Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />


                  {/* Delete Button - Top Right */}
                  <div 
                    className="absolute top-3 right-3 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deleteConfirmId === study.id ? (
                      // Delete confirmation - same style as trash button
                      <div className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-md rounded-full shadow-xl">
                        <span className="text-[9px] font-medium text-white mr-0.5">
                          {isDeletingId === study.id ? "Deleting..." : "Delete?"}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setIsDeletingId(study.id);
                            await onDelete(study.id);
                            setIsDeletingId(null);
                            setDeleteConfirmId(null);
                          }}
                          disabled={isDeletingId === study.id}
                          className="p-1 hover:bg-white/20 rounded-full text-white hover:text-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Confirm delete"
                        >
                          {isDeletingId === study.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDeletingId) setDeleteConfirmId(null);
                          }}
                          disabled={isDeletingId === study.id}
                          className="p-1 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(study.id);
                        }}
                        className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info Below Thumbnail */}
                <div className="mt-3 px-0.5">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-stone-600">
                        {isPdf ? "PDF" : "YouTube"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span className="font-medium">
                      {new Date(study.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
