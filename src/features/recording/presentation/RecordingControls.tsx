"use client";

import React, { useCallback } from "react";
import { Button } from "@/core/components/ui/button";
import { Mic, Square, Pause, Play } from "lucide-react";
import { type RecordingState, isActionAllowed } from "../procedure";

type RecordingControlsProps = {
  recordingState: RecordingState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  disabled?: boolean;
};

/**
 * PRESENTATION LAYER
 * Recording controls with stable callbacks
 */
export const RecordingControls = React.memo(
  ({
    recordingState,
    onStart,
    onPause,
    onResume,
    onStop,
    disabled = false,
  }: RecordingControlsProps) => {
    const canStart = isActionAllowed(recordingState, "start");
    const canPause = isActionAllowed(recordingState, "pause");
    const canResume = isActionAllowed(recordingState, "resume");
    const canStop = isActionAllowed(recordingState, "stop");

    const handleStart = useCallback(() => {
      if (canStart && !disabled) onStart();
    }, [canStart, disabled, onStart]);

    const handlePause = useCallback(() => {
      if (canPause && !disabled) onPause();
    }, [canPause, disabled, onPause]);

    const handleResume = useCallback(() => {
      if (canResume && !disabled) onResume();
    }, [canResume, disabled, onResume]);

    const handleStop = useCallback(() => {
      if (canStop && !disabled) onStop();
    }, [canStop, disabled, onStop]);

    return (
      <div className="flex items-center gap-2">
        {recordingState === "idle" && (
          <Button
            onClick={handleStart}
            disabled={disabled || !canStart}
            className="bg-lienar-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white h-10 px-6 rounded-lg shadow-lg"
          >
            <Mic className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        )}

        {recordingState === "recording" && (
          <>
            <Button
              onClick={handlePause}
              disabled={disabled || !canPause}
              variant="outline"
              className="h-10 px-6 border-2 border-violet-300 text-violet-700 hover:bg-violet-50"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>

            <Button
              onClick={handleStop}
              disabled={disabled || !canStop}
              className="bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white h-10 px-6 rounded-lg"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </>
        )}

        {recordingState === "paused" && (
          <>
            <Button
              onClick={handleResume}
              disabled={disabled || !canResume}
              className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-10 px-6 rounded-lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>

            <Button
              onClick={handleStop}
              disabled={disabled || !canStop}
              className="bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white h-10 px-6 rounded-lg"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </>
        )}
      </div>
    );
  }
);

RecordingControls.displayName = "RecordingControls";
