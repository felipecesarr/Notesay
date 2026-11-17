"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PDFInput } from "./PDFInput";
import { StudyLibrary, Study } from "@/features/youtube-study/presentation/StudyLibrary";
import { PDFReader } from "./PDFReader";
import { createPendingStudy, uploadPDFChunk, triggerPDFProcessing, deletePDFStudy, getPDFStudies, getPDFStudyStatus } from "../controller";
import { saveProgress } from "@/features/read-aloud/controller";
import { usePDFStudies } from "../hooks/usePDFStudies";
import { useUIStore } from "@/core/store/ui-store";
import { Loader2, AlertCircle } from "lucide-react";
import { saveHighlightNote } from "@/features/notes/controller";
import Image from "next/image";
import { motion } from "framer-motion";

type PDFStudy = {
    id: string;
    title: string;
    extractedContent: string | null;
    summary: string | null;
    status: string;
    fileName: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    errorMessage: string | null;
  };

interface PDFStudyTabProps {
  onSendChatMessage?: (message: string) => void;
}

export function PDFStudyTab({ onSendChatMessage }: PDFStudyTabProps) {
  // Use global store for view and currentStudy to persist across mobile tab switches
  const view = useUIStore((state) => state.pdfViewState);
  const setView = useUIStore((state) => state.setPdfViewState);
  const currentStudyId = useUIStore((state) => state.currentPDFStudyId);
  const setCurrentStudyId = useUIStore((state) => state.setCurrentPDFStudyId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStudyId, setProcessingStudyId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("PENDING");
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Data Fetching Hook
  const { studies, studyProgress, refetch } = usePDFStudies();

  // Derive currentStudy from studies and currentStudyId
  const currentStudy = studies.find((s: PDFStudy) => s.id === currentStudyId) || null;

  // Polling for processing status
  const pollStatus = useCallback(async (studyId: string) => {
    const result = await getPDFStudyStatus(studyId);
    
    if (result.success && result.study) {
      setProcessingStatus(result.study.status);
      
      if (result.study.status === "COMPLETED") {
        // Refetch to get full study data
        await refetch();
        setCurrentStudyId(studyId);
        setView("practice");
        setProcessingStudyId(null);
        return true; // Stop polling
      }
      
      if (result.study.status === "FAILED") {
        setProcessingError(result.study.errorMessage || "Processing failed. Please try again.");
        setProcessingStudyId(null);
        return true; // Stop polling
      }
    }
    
    return false; // Continue polling
  }, [refetch]);

  // Polling effect
  useEffect(() => {
    if (!processingStudyId) return;
    
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const poll = async () => {
      if (!isMounted) return;
      
      const shouldStop = await pollStatus(processingStudyId);
      
      if (!shouldStop && isMounted) {
        timeoutId = setTimeout(poll, 3000); // Poll every 3 seconds
      }
    };
    
    // Start polling immediately
    poll();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [processingStudyId, pollStatus]);

  const handleProcess = async (file: File) => {
    setIsProcessing(true);
    setProcessingError(null);
    setProcessingStatus("PENDING");
    
    try {
        // 1. Create Pending Study
        const createResult = await createPendingStudy(file.name);
        if (!createResult.success || !createResult.studyId) {
            throw new Error(createResult.error || "Failed to initialize upload.");
        }
        
        const studyId = createResult.studyId;
        
        // 2. Convert to Base64
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        
        // 3. Chunk Upload (3MB chunks safely under 4.5MB limit)
        const CHUNK_SIZE = 3 * 1024 * 1024; 
        const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);
        
        for (let i = 0; i < totalChunks; i++) {
            const chunk = base64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            const uploadResult = await uploadPDFChunk(studyId, chunk);
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || `Failed to upload chunk ${i + 1}`);
            }
        }
        
        // 4. Trigger Processing
        const triggerResult = await triggerPDFProcessing(studyId);
        
        setIsProcessing(false);

        if (triggerResult.success) {
            setProcessingStudyId(studyId);
            setProcessingStatus("PENDING");
            setView("processing");
            refetch();
        } else {
             throw new Error(triggerResult.error || "Failed to start processing.");
        }

    } catch (err) {
        setIsProcessing(false);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        alert(errorMessage);
        setProcessingError(errorMessage);
    }
  };

  const handleSelectStudy = (id: string) => {
    const study = studies.find((s: PDFStudy) => s.id === id);
    if (study) {
      // Check if study is still processing
      if (study.status === "PENDING" || study.status === "PROCESSING") {
        setProcessingStudyId(study.id);
        setProcessingStatus(study.status);
        setView("processing");
      } else if (study.status === "FAILED") {
        alert("This PDF failed to process. Please try uploading again.");
      } else {
        // COMPLETED or no status (old studies) - open the reader
        setCurrentStudyId(study.id);
        setView("practice");
      }
    }
  };

  const handleDeleteStudy = async (id: string) => {
    const result = await deletePDFStudy(id);
    if (result.success) {
      await refetch();
      if (currentStudyId === id) {
        setView("input");
        setCurrentStudyId(null);
      }
    } else {
      alert("Failed to delete study");
    }
  };

  const handleReaderProgress = useCallback(async (currentPage: number, totalPages: number) => {
      if (currentStudy) {
          await saveProgress(currentStudy.id, "read-aloud", currentPage, totalPages, []);
      }
  }, [currentStudy]);

  // Convert PDF studies to generic Study interface
  const libraryStudies: Study[] = studies.map((s: PDFStudy) => ({
    id: s.id,
    title: s.title || s.fileName,
    thumbnail: "/pdf-placeholder.png", 
    createdAt: s.createdAt,
    summary: s.summary || undefined
  }));

  // Processing View
  if (view === "processing") {
    return (
      <div className="h-full w-full bg-white rounded-4xl flex flex-col items-center justify-center relative overflow-hidden border border-stone-200/50 shadow-sm">
        
        {/* Animated Logo */}
        <motion.div
           animate={{ y: [0, -20, 0] }}
           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
           className="mb-12 relative z-10"
        >
           <Image 
             src="/logos/notelab-input.png" 
             alt="Notesay" 
             width={80} 
             height={80} 
             className="-rotate-12" 
           />
        </motion.div>

        {/* Card Component matching Input style */}
        <div className="relative w-full max-w-lg z-10 px-6">
             {/* Gradient Glow */}
             <div className="absolute inset-0 bg-linear-to-t from-violet-200 to-[#dfecc8] blur-md opacity-150 rounded-4xl" />
             
             {/* Main Card */}
             <div className="relative w-full bg-white border border-stone-50 rounded-4xl p-8 flex flex-col items-center text-center min-h-[220px] justify-center">
                 
                {processingError ? (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <AlertCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-stone-900 mb-2">Processing Failed</h3>
                        <p className="text-xs text-stone-500 mb-6 max-w-60 leading-relaxed">{processingError}</p>
                        
                        <button
                            onClick={() => {
                                setProcessingError(null);
                                setView("input");
                            }}
                            className="px-5 py-2.5 bg-[#1b5f4a] text-[#dfecc8] rounded-full text-xs font-medium hover:bg-[#1b5f4a]/90 transition-all hover:scale-105"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-16 h-16 rounded-full bg-[#1b5f4a]/5 flex items-center justify-center mb-5 relative">
                            <div className="absolute inset-0 rounded-full border-t-2 border-[#1b5f4a] animate-spin"></div>
                            <Loader2 className="w-6 h-6 text-[#1b5f4a]" />
                        </div>
                        
                        <h3 className="text-base font-semibold text-[#1b5f4a] mb-2">
                            {processingStatus === "PENDING" ? "Starting..." : "Processing Your PDF"}
                        </h3>
                        
                        <div className="w-full max-w-[200px] bg-stone-100 rounded-full h-1.5 mb-4 overflow-hidden">
                            <motion.div 
                                className="h-full bg-[#1b5f4a]"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 120, ease: "linear" }}
                            />
                        </div>

                        <p className="text-xs text-stone-500 max-w-[260px] leading-relaxed mb-6">
                            This may take a few minutes for larger files. We&apos;re extracting text, formatting content, and preparing your study session.
                        </p>

                        <button
                            onClick={() => setView("input")}
                            className="text-[10px] text-stone-400 hover:text-[#1b5f4a] transition-colors font-medium"
                        >
                            Cancel & Upload Another
                        </button>
                    </div>
                )}
             </div>
        </div>
      </div>
    );
  }

  if (view === "practice" && currentStudy) {
    const progress = studyProgress[currentStudy.id] as { completedChunks?: number } | undefined;
    const initialPage = progress?.completedChunks ?? 0;

    return (
      <PDFReader
        study={{
            id: currentStudy.id,
            title: currentStudy.title,
            extractedContent: currentStudy.extractedContent || "",
        }}
        initialPage={initialPage}
        onProgressChange={handleReaderProgress}
        onBack={() => {
            refetch();
            setView("input");
        }}
        onAskAbout={onSendChatMessage}
        onSaveNote={async (text) => {
            return await saveHighlightNote(
                text,
                "From PDF Study: " + currentStudy.title,
                "other",
                currentStudy.id
            );
        }}
      />
    );
  }

  if (view === "library") {
    return (
      <div className="h-full w-full">
        <StudyLibrary
          studies={libraryStudies}
          onSelect={handleSelectStudy}
          onDelete={handleDeleteStudy}
          onAddNew={() => setView("input")}
          type="pdf"
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-4xl flex flex-col relative overflow-hidden border border-stone-200/50 shadow-sm">

      {studies.length > 0 && (
      <div className="absolute flex top-6 right-8 z-10 bg-stone-50 rounded-md px-3 py-2 hover:bg-stone-100">
        <button
          onClick={() => setView("library")}
          className="text-xs font-medium text-stone-500"
        >
          Library
        </button>
        <div className="ml-2 text-xs text-stone-500 font-medium bg-stone-200 transition-colors h-4.5 w-4.5 flex items-center justify-center rounded-full px-2">
          {studies.length}
        </div>
      </div>
      )}
      
      <PDFInput
        onProcess={handleProcess}
        isProcessing={isProcessing}
        recentPDFs={studies.slice(0, 3)}
        onSelectRecent={handleSelectStudy}
      />
    </div>
  );
}

