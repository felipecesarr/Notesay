import { useState, useCallback, useEffect } from "react";
import { ttsService } from "@/meetmate/services/ai/tts";

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    ttsService.speak(
      text,
      () => setIsSpeaking(false), // onEnd
      (err) => {
        console.error("Notesay operation failed.");
        setIsSpeaking(false);
      } // onError
    );
  }, [isSpeaking]);

  const stop = useCallback(() => {
    ttsService.stop();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  return { isSpeaking, speak, stop };
}
