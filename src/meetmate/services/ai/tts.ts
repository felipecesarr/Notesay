/**
 * Text-to-Speech service using Google Translate TTS API
 * Scalable singleton service for high-quality voice synthesis
 */
class TTSService {
  private audioCache: Map<string, Blob> = new Map();
  private currentAudio: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;

  async speak(text: string, onEnd?: () => void, onError?: (error: Error) => void): Promise<void> {
    try {
      this.stop();

      let audioBlob = this.audioCache.get(text);

      if (!audioBlob) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`TTS API failed with status ${response.status}`);
        }

        audioBlob = await response.blob();
        this.audioCache.set(text, audioBlob);
      }

      this.currentBlobUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(this.currentBlobUrl);

      this.currentAudio.onended = () => {
        this.cleanup();
        onEnd?.();
      };

      this.currentAudio.onerror = () => {
        this.cleanup();
        onError?.(new Error('Audio playback failed'));
      };

      await this.currentAudio.play();

    } catch (error) {
      this.cleanup();
      onError?.(error instanceof Error ? error : new Error('Unknown TTS error'));
    }
  }

  private cleanup(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  stop(): void {
    this.cleanup();
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  clearCache(): void {
    this.audioCache.clear();
  }

  isAvailable(): boolean {
    return true;
  }
}

export const ttsService = new TTSService();
