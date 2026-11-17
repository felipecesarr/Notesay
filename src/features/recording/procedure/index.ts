/**
 * PROCEDURE LAYER - Recording Feature
 * Pure business logic for recording state and timer management
 * No I/O, no React hooks - just pure functions
 */

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export type RecordingConfig = {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
};

// Default recording configuration
export const DEFAULT_RECORDING_CONFIG: RecordingConfig = {
  mimeType: "video/webm;codecs=vp9",
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000, // 128 kbps
};

// Fallback MIME types if vp9 is not supported
export const FALLBACK_MIME_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

// Get supported MIME type from browser
export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    return FALLBACK_MIME_TYPES[0]; // Return default for SSR
  }

  for (const mimeType of FALLBACK_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return FALLBACK_MIME_TYPES[0]; // Fallback to default
}

// Recording state machine transitions
export function getNextRecordingState(
  currentState: RecordingState,
  action: "start" | "pause" | "resume" | "stop"
): RecordingState {
  const transitions: Record<RecordingState, Partial<Record<typeof action, RecordingState>>> = {
    idle: {
      start: "recording",
    },
    recording: {
      pause: "paused",
      stop: "stopped",
    },
    paused: {
      resume: "recording",
      stop: "stopped",
    },
    stopped: {
      start: "recording", // Allow restart
    },
  };

  return transitions[currentState][action] || currentState;
}

// Validate if action is allowed in current state
export function isActionAllowed(
  currentState: RecordingState,
  action: "start" | "pause" | "resume" | "stop"
): boolean {
  const allowedActions: Record<RecordingState, string[]> = {
    idle: ["start"],
    recording: ["pause", "stop"],
    paused: ["resume", "stop"],
    stopped: ["start"],
  };

  return allowedActions[currentState].includes(action);
}

// Timer utilities
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimeDetailed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return formatTime(seconds);
}

// Calculate recording duration from chunks
export function calculateDuration(chunks: Blob[]): number {
  // Rough estimation based on blob size and bitrate
  // For precise duration, would need to parse the video file
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const estimatedDuration = totalSize / (DEFAULT_RECORDING_CONFIG.videoBitsPerSecond! / 8);
  return Math.round(estimatedDuration);
}

// Validate recording chunks
export function validateRecordingChunks(chunks: Blob[]): {
  isValid: boolean;
  error?: string;
} {
  if (chunks.length === 0) {
    return { isValid: false, error: "No recording data available" };
  }

  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

  if (totalSize === 0) {
    return { isValid: false, error: "Recording is empty" };
  }

  // Minimum 1KB to be considered valid
  if (totalSize < 1024) {
    return { isValid: false, error: "Recording is too short" };
  }

  // Maximum 500MB to prevent memory issues
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (totalSize > maxSize) {
    return { isValid: false, error: "Recording is too large (max 500MB)" };
  }

  return { isValid: true };
}

// Create blob from chunks
export function createRecordingBlob(chunks: Blob[], mimeType: string): Blob {
  return new Blob(chunks, { type: mimeType });
}

// Generate filename for recording
export function generateRecordingFilename(
  skill: string,
  timestamp: Date = new Date()
): string {
  const dateStr = timestamp.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = timestamp.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
  const skillSlug = skill.toLowerCase().replace(/\s+/g, "-");

  return `meetmate-${skillSlug}-${dateStr}-${timeStr}.webm`;
}

// Calculate estimated file size
export function estimateFileSize(durationSeconds: number, config: RecordingConfig): number {
  const videoBitrate = config.videoBitsPerSecond || DEFAULT_RECORDING_CONFIG.videoBitsPerSecond!;
  const audioBitrate = config.audioBitsPerSecond || DEFAULT_RECORDING_CONFIG.audioBitsPerSecond!;

  const totalBitrate = videoBitrate + audioBitrate;
  const estimatedBytes = (totalBitrate / 8) * durationSeconds;

  return Math.round(estimatedBytes);
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Check if browser supports recording
export function checkRecordingSupport(): {
  supported: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof navigator === "undefined") {
    return { supported: false, errors: ["Navigator not available (SSR)"] };
  }

  if (!navigator.mediaDevices) {
    errors.push("MediaDevices API not available");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    errors.push("getUserMedia not supported");
  }

  if (typeof MediaRecorder === "undefined") {
    errors.push("MediaRecorder API not available");
  }

  return {
    supported: errors.length === 0,
    errors,
  };
}

// Get recommended recording settings based on device
export function getRecommendedSettings(): RecordingConfig {
  if (typeof navigator === "undefined") {
    return DEFAULT_RECORDING_CONFIG;
  }

  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    // Lower quality for mobile to save bandwidth/storage
    return {
      mimeType: getSupportedMimeType(),
      videoBitsPerSecond: 1500000, // 1.5 Mbps
      audioBitsPerSecond: 96000, // 96 kbps
    };
  }

  return {
    ...DEFAULT_RECORDING_CONFIG,
    mimeType: getSupportedMimeType(),
  };
}
