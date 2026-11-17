"use client";

import React from "react";
import { Clock } from "lucide-react";
import { formatTime } from "../procedure";

type RecordingTimerProps = {
  seconds: number;
  isRecording: boolean;
};

/**
 * PRESENTATION LAYER
 * Simple timer display component
 */
export const RecordingTimer = React.memo(
  ({ seconds, isRecording }: RecordingTimerProps) => {
    const formattedTime = formatTime(seconds);

    return (
      <div
        className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        ${isRecording ? "bg-red-50 text-red-600" : "bg-stone-100 text-stone-600"}
        transition-colors
      `}
      >
        <Clock className="w-4 h-4" />
        <span className="font-mono text-sm font-medium tabular-nums">
          {formattedTime}
        </span>
        {isRecording && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }
);

RecordingTimer.displayName = "RecordingTimer";
