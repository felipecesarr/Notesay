import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// --- Types for Web Speech API ---
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

// Global window augmentation
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Use generic EventTarget for the ref, cast when needed
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Track browser support without triggering re-renders during effect
  const browserSupportsSpeechRecognition = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        browserSupportsSpeechRecognition.current = false;
        // Don't call setError here to avoid sync re-render inside effect
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
            setTranscript((prev) => prev + " " + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error");
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Check support on initial mount/interaction instead of effect
  // Removed causing useEffect to avoid cascading renders.
  // Error will be set when user attempts to start listening.

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Solicita permissão explícita do microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Libera a stream imediatamente (só precisamos da permissão)
      stream.getTracks().forEach(track => track.stop());

      return true;
    } catch (error) {
      console.error("Microphone permission denied:");
      setError("Microphone permission denied. Please allow access.");
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!browserSupportsSpeechRecognition.current) {
         setError("Browser does not support speech recognition.");
         return false;
    }

    // Verificar permissão antes de iniciar
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return false;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        return true;
      } catch (e) {
        console.error("Error starting recognition:");
        setError("Failed to start speech recognition.");
        return false;
      }
    }

    return false;
  }, [isListening, requestMicrophonePermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors if already stopped (e.g. AbortError)
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return useMemo(() => ({
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }), [isListening, transcript, startListening, stopListening, resetTranscript, error]);
}
