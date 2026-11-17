"use client";

import React, { useState } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Square, VideoOff, PanelRight, Mic, Video, ArrowRight } from "lucide-react";
import { type SkillData } from "@/features/skills/hooks/useSkills";

interface CameraPreviewProps {
  webcamRef: React.RefObject<Webcam | null>;
  capturing: boolean;
  elapsedTime: number;
  currentQuestion: string;
  isProcessingAI: boolean;
  onStartCapture: () => void;
  onStopCapture: () => void;
  formatTime: (seconds: number) => string;
  onToggleSidebar: () => void;
  showSidebar: boolean;
  selectedSkillName: string;
  onSelectSkill: (skillName: string, options?: {
    systemPrompt?: string;
    context?: Array<{ type: "pdf" | "url" | "video"; content: string; title: string }>;
    interviewMode?: "ai-asks" | "user-asks";
  }) => void;
  skills: SkillData[];
  transcript?: string; // Current voice transcript (shown in real-time)
  onSendTranscript?: () => void; // Manual send handler
  isMobile?: boolean; // Mobile layout mode
}

const COLOR_CLASSES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-600",
  sky: "bg-sky-100 text-sky-600",
  purple: "bg-purple-100 text-purple-600",
  emerald: "bg-emerald-100 text-emerald-600",
  violet: "bg-violet-100 text-violet-600",
  stone: "bg-stone-100 text-stone-600",
  blue: "bg-blue-100 text-blue-600",
  cyan: "bg-cyan-100 text-cyan-600",
  teal: "bg-teal-100 text-teal-600",
  green: "bg-green-100 text-green-600",
  lime: "bg-lime-100 text-lime-600",
  orange: "bg-orange-100 text-orange-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

export function CameraPreview({
  webcamRef,
  capturing,
  elapsedTime,
  currentQuestion,
  isProcessingAI,
  onStartCapture,
  onStopCapture,
  formatTime,
  onToggleSidebar,
  showSidebar,
  selectedSkillName,
  onSelectSkill,
  skills,
  transcript = "",
  onSendTranscript,
  isMobile = false,
}: CameraPreviewProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Toggle video - mounts/unmounts Webcam component to truly stop camera
  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev);
  };

  // Handle start capture - enables video if disabled, then starts
  const handleStartCapture = () => {
    if (!isVideoEnabled) {
      setIsVideoEnabled(true);
    }
    onStartCapture();
  };

  // Render controls component to avoid duplication
  const renderControls = () => (
    <AnimatePresence mode="wait">
      {!capturing ? (
        <>
          {/* Video Toggle Button */}
          <motion.button
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all ${
              isVideoEnabled
                ? "bg-stone-900/30 backdrop-blur-md text-white hover:bg-stone-900/50"
                : "bg-rose-500 text-white hover:bg-rose-600"
            }`}
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
          </motion.button>

          {/* Record Button */}
          <motion.button
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handleStartCapture}
            className={`rounded-full flex items-center justify-center transition-transform hover:scale-105 bg-[#dfecc8] hover:bg-[#dfecc870] shadow-lg ${
              isMobile ? "w-12 h-12" : "w-14 h-14"
            }`}
            aria-label="Start recording"
          >
            <Mic className={isMobile ? "w-5 h-5 text-[#1b5f4a]" : "w-6 h-6 text-[#1b5f4a]"} />
          </motion.button>
        </>
      ) : (
        /* Recording Mode - Wave + Transcript + Send + Stop */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`flex items-start gap-3 bg-stone-900/60 backdrop-blur-md rounded-3xl ${
            isMobile ? "px-4 py-3 max-w-full" : "px-6 py-4 max-w-3xl"
          }`}
        >
          {/* Inline Waveform Animation */}
          <div className="flex items-center gap-1 shrink-0 mt-1">
            {[...Array(isMobile ? 5 : 8)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-[#defcc8] rounded-full"
                animate={{
                  height: ["8px", "20px", "8px"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Real-time Transcript Preview - Multi-line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex-1 text-white font-medium min-w-0 leading-relaxed overflow-y-auto ${
              isMobile ? "text-xs max-h-16" : "text-sm max-h-24"
            }`}
          >
            {transcript && transcript.length > 0 ? transcript : "Listening..."}
          </motion.div>

          {/* Action Buttons Container */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Send Button - Only show when there's transcript */}
            {transcript && transcript.length > 5 && !isProcessingAI && onSendTranscript && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={onSendTranscript}
                className={`rounded-full flex items-center justify-center transition-all hover:scale-110 bg-[#1b5f4a] hover:bg-[#1b5f4a]/80 ${
                  isMobile ? "w-8 h-8" : "w-9 h-9"
                }`}
                aria-label="Send message"
                title="Send message"
              >
                <ArrowRight className={isMobile ? "w-3.5 h-3.5 text-[#defcc8]" : "w-4 h-4 text-[#defcc8]"} />
              </motion.button>
            )}

            {/* End Session Button */}
            <button
              onClick={onStopCapture}
              className={`rounded-full flex items-center justify-center transition-all hover:scale-110 bg-rose-600 hover:bg-rose-700 shadow-lg ${
                isMobile ? "w-8 h-8" : "w-9 h-9"
              }`}
              aria-label="End session"
              title="End session"
            >
              <Square className={isMobile ? "w-3 h-3 text-white fill-current" : "w-3.5 h-3.5 text-white fill-current"} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        {/* Camera Container */}
        <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden mx-2 mt-2">
          {isVideoEnabled ? (
            <Webcam
              ref={webcamRef}
              audio={true}
              muted={true}
              mirrored={true}
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user"
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <VideoOff className="w-16 h-16 text-white/60" />
            </div>
          )}

          {/* Question Overlay (Top) */}
          <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none px-2 z-40">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-full"
              >
                <div className="bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center shadow-lg pointer-events-auto">
                  {/* Skill Selector Pills - Mobile */}
                  <div className="relative w-full mx-auto mb-2 overflow-hidden">
                    <div className="flex items-center gap-1.5 overflow-x-auto -mx-3 px-3 py-1 scrollbar-hide pointer-events-auto scroll-smooth">
                      {skills?.map((skill) => {
                        const isSelected = selectedSkillName === skill.name;
                        const colorClass = COLOR_CLASSES[skill.color] || COLOR_CLASSES.stone;

                        return (
                          <button
                            key={skill.id}
                            onClick={() => onSelectSkill(skill.name, {
                              systemPrompt: skill.systemPrompt,
                              context: skill.contextSources,
                              interviewMode: skill.interviewMode
                            })}
                            className={`
                              shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ease-out whitespace-nowrap
                              ${isSelected
                                ? `${colorClass} scale-105`
                                : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                              }
                            `}
                          >
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isProcessingAI ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-white/30 rounded-full w-3/4 mx-auto" />
                      <div className="h-3 bg-white/30 rounded-full w-1/2 mx-auto" />
                    </div>
                  ) : (
                    <p className="text-white text-sm font-medium leading-snug drop-shadow-md line-clamp-2">
                      &quot;{currentQuestion}&quot;
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Timer - Below Camera (Mobile) */}
        {capturing && (
          <div className="flex justify-center py-2">
            <div className="bg-stone-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 border border-stone-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono font-medium text-sm">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        )}

        {/* Controls - Below Camera (Mobile) */}
        <div className="flex justify-center items-center gap-3 py-3 px-4 bg-stone-50">
          {renderControls()}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div data-tour="camera-preview" className="flex-1 flex items-center justify-center bg-transparent relative h-full">
      <div className="relative w-full h-full flex items-center justify-center rounded-[3rem] overflow-hidden shadow-xs bg-transparent">
        {isVideoEnabled ? (
          <Webcam
            ref={webcamRef}
            audio={true}
            muted={true}
            mirrored={true}
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user"
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <VideoOff className="w-20 h-20 text-white/60" />
          </div>
        )}

        {/* Timer (Top Left) */}
        {capturing && (
          <div className="absolute top-6 left-6 bg-stone-900/60 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 z-50">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
          </div>
        )}

        {/* Sidebar Toggle (Top Right) - Desktop only */}
        <button
          data-tour="sidebar-toggle"
          onClick={onToggleSidebar}
          className="absolute top-6 right-6 p-3 rounded-full bg-stone-900/30 backdrop-blur-md text-white hover:bg-stone-900/80 z-50 transition-all"
        >
          <PanelRight className="w-5 h-5 text-white" />
        </button>

        {/* Question Overlay (Top Center) */}
        <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none px-12 z-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
                maxWidth: showSidebar ? "85%" : "64rem"
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                opacity: { duration: 0.3 },
                y: { duration: 0.3 },
                maxWidth: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              className="w-full"
            >
              <div className="bg-stone-900/20 backdrop-blur-md border border-white/10 rounded-3xl p-5 text-center shadow-2xl pointer-events-auto">

                {/* Skill Selector Pills */}
                <div data-tour="skill-pills" className="relative w-full mx-auto mb-3 group overflow-hidden">

                  <div className="flex items-center gap-2 overflow-x-auto -mx-5 px-5 py-1 scrollbar-hide pointer-events-auto scroll-smooth">
                    {skills?.map((skill) => {
                      const isSelected = selectedSkillName === skill.name;
                      const colorClass = COLOR_CLASSES[skill.color] || COLOR_CLASSES.stone;

                      return (
                        <button
                          key={skill.id}
                          onClick={() => onSelectSkill(skill.name, {
                            systemPrompt: skill.systemPrompt,
                            context: skill.contextSources,
                            interviewMode: skill.interviewMode
                          })}
                          className={`
                            shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out whitespace-nowrap
                            ${isSelected
                              ? `${colorClass} scale-105`
                              : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:text-white hover:scale-102"
                            }
                          `}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isProcessingAI ? (
                  <div className="space-y-2.5 animate-pulse">
                    <div className="h-4 bg-white/30 rounded-full w-3/4 mx-auto" />
                    <div className="h-4 bg-white/30 rounded-full w-1/2 mx-auto" />
                  </div>
                ) : (
                  <h2 className="text-white text-lg md:text-xl font-medium leading-snug drop-shadow-md">
                    &quot;{currentQuestion}&quot;
                  </h2>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls (Bottom Center) */}
        <div data-tour="recording-controls" className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 pointer-events-auto z-50">
          {renderControls()}
        </div>
      </div>
    </div>
  );
}
