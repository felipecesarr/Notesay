import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { Input } from "@/core/components/ui/input";
import { FileText, Link as LinkIcon, Upload, X, Check, AtSign, Folder } from "lucide-react";
import { uploadPDFFile } from "@/meetmate/services/ai/context-processor";
import { ContextSource } from "./types";
import { getYouTubeStudies } from "@/features/youtube-study/controller";
import { getPracticeTexts } from "@/features/read-aloud/controller";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ContextSourceInputProps {
  sources: ContextSource[];
  onChange: (sources: ContextSource[]) => void;
}

interface AvailableSource {
  id: string;
  title: string;
  type: "youtube" | "text";
  videoUrl?: string;
  content?: string;
}

export const ContextSourceInput = React.memo(({ sources, onChange }: ContextSourceInputProps) => {
  const [showSection, setShowSection] = useState(sources.length > 0);
  const [inputType, setInputType] = useState<"pdf" | "url" | "video" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [availableSources, setAvailableSources] = useState<AvailableSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryButtonRef = useRef<HTMLButtonElement>(null);

  // Load available sources from library
  useEffect(() => {
    const loadSources = async () => {
      setIsLoadingSources(true);
      const [youtubeResult, textsResult] = await Promise.all([
        getYouTubeStudies(),
        getPracticeTexts()
      ]);

      const sources: AvailableSource[] = [];

      // Add YouTube videos
      if (youtubeResult.success && youtubeResult.studies) {
        sources.push(...youtubeResult.studies.map((study) => ({
          id: study.id,
          title: study.title,
          type: "youtube" as const,
          videoUrl: study.videoUrl,
          content: study.extractedContent,
        })));
      }

      // Add AI-generated texts
      if (textsResult.success && textsResult.texts) {
        sources.push(...textsResult.texts.map((text) => ({
          id: text.id,
          title: text.title,
          type: "text" as const,
          content: text.content,
        })));
      }

      setAvailableSources(sources);
      setIsLoadingSources(false);
    };
    loadSources();
  }, []);

  const handleAddSource = () => {
    if (!inputType || !inputValue.trim()) return;
    
    const newSource: ContextSource = {
      type: inputType,
      content: inputValue,
      title: inputType === "url" ? inputValue : `File ${sources.length + 1}`
    };
    
    onChange([...sources, newSource]);
    setInputValue("");
    // Keep input open to allow adding more
  };

  const handleSelectFromLibrary = (source: AvailableSource) => {
    // Check if already added
    const alreadyAdded = sources.some(s => 
      (s.type === "video" && s.content === source.videoUrl) ||
      (s.type === "pdf" && s.title === source.title)
    );

    if (alreadyAdded) {
      // Remove if already added
      onChange(sources.filter(s => 
        !((s.type === "video" && s.content === source.videoUrl) ||
          (s.type === "pdf" && s.title === source.title))
      ));
    } else {
      // Add new source
      const newSource: ContextSource = {
        type: source.type === "youtube" ? "video" : "pdf",
        content: source.type === "youtube" ? source.videoUrl! : source.content!,
        title: source.title
      };
      onChange([...sources, newSource]);
    }
  };

  const isSourceSelected = (source: AvailableSource) => {
    return sources.some(s => 
      (s.type === "video" && s.content === source.videoUrl) ||
      (s.type === "pdf" && s.title === source.title)
    );
  };

  const handleRemoveSource = (index: number) => {
    const newSources = [...sources];
    newSources.splice(index, 1);
    onChange(newSources);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileUri = await uploadPDFFile(file);
        const newSource: ContextSource = {
          type: "pdf",
          content: fileUri,
          title: file.name
        };
        onChange([...sources, newSource]);
      } catch (error) {
        console.error("Failed to upload PDF:");
      }
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowSection(!showSection)}
        className="flex items-center justify-between w-full"
      >
        <Label className="text-[10px] font-bold text-[#1b5f4a] uppercase tracking-wider cursor-pointer">
          Context Sources {sources.length > 0 && `(${sources.length})`}
        </Label>
        <span className="text-[10px] text-[#1b5f4a] font-medium">
          {showSection ? "Hide" : "Add"}
        </span>
      </button>
      
      {showSection && (
        <div className="space-y-3 p-3 bg-white rounded-lg">
          {/* Existing Sources */}
          {sources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-[9px] font-bold text-[#1b5f4a] uppercase tracking-wider">Selected Sources</h4>
                <div className="flex-1 h-px bg-[#1b5f4a]" />
                <span className="text-[9px] text-[#1b5f4a] font-medium">{sources.length}</span>
              </div>
              
              <div className="space-y-1.5">
                {sources.map((source, idx) => (
                  <div 
                    key={idx} 
                    className="group flex items-center justify-between p-2.5 bg-[#dfecc830] rounded-lg border border-[#1b5f4a30] hover:border-[#1b5f4a70] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Source Icon */}
                      <div className="shrink-0 w-8 h-8 rounded-md bg-[#dfecc870] flex items-center justify-center">
                        {source.type === "video" ? (
                          <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-600">
                            <path
                              fill="currentColor"
                              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                            />
                          </svg>
                        ) : source.type === "pdf" ? (
                          <FileText className="w-4 h-4 text-red-600" />
                        ) : (
                          <LinkIcon className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      
                      {/* Source Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-[#1b5f4a] truncate">
                          {source.title || source.content}
                        </p>
                        <p className="text-[9px] text-[#1b5f4a] uppercase tracking-wide mt-0.5">
                          {source.type === "video" ? "YouTube Video" : source.type === "pdf" ? "PDF Document" : "Web URL"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveSource(idx)}
                      className="shrink-0 p-1.5 rounded-md hover:bg-[#dfecc870] text-[#1b5f4a] hover:text-[#1b5f4a] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Source */}
          {!inputType ? (
            <div>
              {sources.length > 0 && <div className="h-px bg-[#1b5f4a30] my-3" />}
              
              {/* Library Button */}
              <div className="relative mb-2">
                <button
                  ref={libraryButtonRef}
                  type="button"
                  onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-[10px] font-medium bg-[#dfecc830] text-[#1b5f4a] hover:bg-[#dfecc870] hover:text-[#1b5f4a] transition-colors"
                >
                  <AtSign className="w-3.5 h-3.5" />
                  Select from Library
                </button>

                {/* Library Popover */}
                {isLibraryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLibraryOpen(false)} />
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 max-h-64 bg-white rounded-lg border border-[#1b5f4a30] shadow-lg overflow-hidden"
                      >
                        <div className="overflow-y-auto max-h-64 scrollbar-hide">
                          {isLoadingSources ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-5 h-5 border-2 border-[#1b5f4a30] border-t-[#1b5f4a70] rounded-full animate-spin" />
                            </div>
                          ) : availableSources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 px-4">
                              <Folder className="w-6 h-6 text-stone-300 mb-2" />
                              <p className="text-[10px] text-stone-400 text-center">
                                No sources available
                              </p>
                            </div>
                          ) : (
                            <div className="p-2 space-y-2">
                              {/* YouTube Section */}
                              {availableSources.filter(s => s.type === "youtube").length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 px-2 py-1">
                                    <Folder className="w-3 h-3 text-stone-500" />
                                    <span className="text-[9px] font-semibold text-stone-600">YouTube</span>
                                    <div className="flex-1 h-px bg-stone-200" />
                                  </div>
                                  {availableSources.filter(s => s.type === "youtube").map((source) => (
                                    <button
                                      key={source.id}
                                      type="button"
                                      onClick={() => handleSelectFromLibrary(source)}
                                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-[#dfecc870] transition-colors"
                                    >
                                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-600 shrink-0">
                                        <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                      </svg>
                                      <span className="text-[10px] font-medium text-stone-700 truncate flex-1 text-left">
                                        {source.title}
                                      </span>
                                      {isSourceSelected(source) && (
                                        <div className="shrink-0 w-3.5 h-3.5 bg-[#1b5f4a] rounded-full flex items-center justify-center">
                                          <Check className="w-2.5 h-2.5 text-[#dfecc8]" />
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Text Section */}
                              {availableSources.filter(s => s.type === "text").length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 px-2 py-1">
                                    <Folder className="w-3 h-3 text-stone-500" />
                                    <span className="text-[9px] font-semibold text-stone-600">AI Texts</span>
                                    <div className="flex-1 h-px bg-stone-200" />
                                  </div>
                                  {availableSources.filter(s => s.type === "text").map((source) => (
                                    <button
                                      key={source.id}
                                      type="button"
                                      onClick={() => handleSelectFromLibrary(source)}
                                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-[#dfecc870] transition-colors"
                                    >
                                      <Image src="/logos/notelab-main.png" alt="AI Text" width={16} height={16} className="shrink-0" />
                                      <span className="text-[10px] font-medium text-[#1b5f4a] truncate flex-1 text-left">
                                        {source.title}
                                      </span>
                                      {isSourceSelected(source) && (
                                        <div className="shrink-0 w-3.5 h-3.5 bg-[#1b5f4a] rounded-full flex items-center justify-center">
                                          <Check className="w-2.5 h-2.5 text-[#dfecc8]" />
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInputType("url")}
                className="h-8 text-[10px] bg-[#dfecc870] text-[#1b5f4a] border-0 hover:bg-[#dfecc8] hover:text-[#1b5f4a]"
              >
                <LinkIcon className="w-3 h-3 mr-1.5" /> Website
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-[10px] bg-[#dfecc870] text-[#1b5f4a] border-0 hover:bg-[#dfecc8] hover:text-[#1b5f4a]"
              >
                <Upload className="w-3 h-3 mr-1.5" /> PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInputType("video")}
                className="h-8 text-[10px] bg-[#dfecc870] text-[#1b5f4a] border-0 hover:bg-[#dfecc8] hover:text-[#1b5f4a]"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 mr-1.5 fill-current">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <div className="relative flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputType === "video" ? "Paste YouTube URL..." : "Paste website URL..."}
                  className="h-8 text-xs bg-white border-[#dfecc870] pr-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSource();
                    } else if (e.key === "Escape") {
                      setInputType(null);
                      setInputValue("");
                    }
                  }}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <button
                    onClick={handleAddSource}
                    disabled={!inputValue.trim()}
                    className="p-1 hover:bg-[#dfecc870] rounded text-[#1b5f4a] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setInputType(null);
                      setInputValue("");
                    }}
                    className="p-1 hover:bg-[#dfecc870] rounded text-[#1b5f4a]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setInputType(null);
                  setInputValue("");
                }}
                className="h-8 px-2 text-[10px] text-[#1b5f4a] hover:text-[#1b5f4a] hover:bg-[#dfecc870]"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ContextSourceInput.displayName = "ContextSourceInput";
