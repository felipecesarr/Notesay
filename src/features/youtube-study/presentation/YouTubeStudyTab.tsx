"use client";

import React, { useState } from "react";
import { VideoInput } from "./VideoInput";
import { StudyLibrary } from "./StudyLibrary";
import { PracticePlayer } from "./PracticePlayer";
import { processYouTubeVideo, deleteYouTubeStudy, type YouTubeStudy } from "../controller";
import { saveProgress } from "@/features/read-aloud/controller";
import { useYouTubeStudies } from "../hooks/useYouTubeStudies";
import { useUIStore } from "@/core/store/ui-store";

interface YouTubeStudyTabProps {
  onSendChatMessage?: (message: string) => void;
}

export function YouTubeStudyTab({ onSendChatMessage }: YouTubeStudyTabProps) {
  // Use global store for view and currentStudy to persist across mobile tab switches
  const view = useUIStore((state) => state.youtubeViewState);
  const setView = useUIStore((state) => state.setYoutubeViewState);
  const currentStudyId = useUIStore((state) => state.currentYouTubeStudyId);
  const setCurrentStudyId = useUIStore((state) => state.setCurrentYouTubeStudyId);

  const [isProcessing, setIsProcessing] = useState(false);
  // Data Fetching Hook (React Query)
  const { studies, studyProgress, refetch: refetchStudies } = useYouTubeStudies();

  // Derive currentStudy from studies and currentStudyId
  const currentStudy = studies.find(s => s.id === currentStudyId) || null;

  const handleExtract = async (url: string) => {
    setIsProcessing(true);
    const result = await processYouTubeVideo(url);
    setIsProcessing(false);

    if (result.success && result.study) {
      setCurrentStudyId(result.study.id);
      setView("practice");
      refetchStudies();
    } else {
      alert(result.error || "Failed to process video");
    }
  };

  const handleSelectStudy = (id: string) => {
    const study = studies.find((s) => s.id === id);
    if (study) {
      setCurrentStudyId(study.id);
      setView("practice");
    }
  };

  const handleDeleteStudy = async (id: string) => {
    const result = await deleteYouTubeStudy(id);
    if (result.success) {
      await refetchStudies();
      await refetchStudies();
      if (currentStudyId === id) {
        setView("input");
        setCurrentStudyId(null);
      }
    } else {
      alert("Failed to delete study");
    }
  };

  const handleProgressChange = async (mode: string, completedChunks: number, totalChunks: number, completedIndices: number[]) => {
    if (currentStudy) {
      await saveProgress(currentStudy.id, mode, completedChunks, totalChunks, completedIndices);
      refetchStudies();
    }
  };

  if (view === "practice" && currentStudy) {
    return (
      <PracticePlayer
        study={currentStudy}
        onBack={() => setView("input")}
        progressData={studyProgress[currentStudy.id]}
        onProgressChange={handleProgressChange}
        onAskAbout={onSendChatMessage}
      />
    );
  }

  if (view === "library") {
    return (
      <div className="h-full w-full">
        <StudyLibrary
          studies={studies.map(s => ({ ...s, thumbnail: s.thumbnail || "" }))}
          onSelect={handleSelectStudy}
          onDelete={handleDeleteStudy}
          onAddNew={() => setView("input")}
        />
      </div>
    );
  }

  // Input View (Default)
  return (
    <div className="h-full w-full bg-white rounded-4xl flex flex-col relative overflow-hidden border border-stone-200/50 shadow-sm">

      {studies.length > 0 && (
      <div className="absolute flex top-4 right-4 md:top-6 md:right-8 z-10 bg-stone-50 rounded-md px-2 md:px-3 py-1.5 md:py-2 hover:bg-stone-100">
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
      
      <VideoInput
        onExtract={handleExtract}
        isProcessing={isProcessing}
        recentVideos={studies.slice(0, 3).map(s => ({ ...s, thumbnail: s.thumbnail || "" }))}
        onSelectRecent={handleSelectStudy}
      />
    </div>
  );
}
