export class TTSClient {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private queue: string[] = [];
  private isProcessingQueue = false;
  private onEndGlobal?: () => void;

  async speak(text: string, onEnd?: () => void, onError?: (err: any) => void) {
    if (!text) return;
    
    if (onEnd) this.onEndGlobal = onEnd; // Keep track of the final onEnd callback
    
    this.queue.push(text);
    if (!this.isProcessingQueue) {
      this.processQueue(onError);
    }
  }

  private async processQueue(onError?: (err: any) => void) {
    this.isProcessingQueue = true;
    
    while (this.queue.length > 0) {
      const text = this.queue.shift()!;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${apiUrl}/api/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch TTS audio");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        this.audio = new Audio(url);
        
        await new Promise<void>((resolve, reject) => {
          if (!this.audio) return resolve(); // In case it was stopped synchronously
          
          this.audio.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          
          this.audio.onerror = (e) => {
            console.error("Audio playback error", e);
            URL.revokeObjectURL(url);
            reject(e);
          };

          this.isPlaying = true;
          this.audio.play().catch(reject);
        });
        
        this.isPlaying = false;
        
      } catch (error) {
        console.error("TTS Client error:", error);
        if (onError) onError(error);
      }
    }
    
    this.isProcessingQueue = false;
    
    // Only call onEnd when the entire queue is drained
    if (this.queue.length === 0 && this.onEndGlobal) {
      this.onEndGlobal();
      this.onEndGlobal = undefined;
    }
  }

  stop() {
    this.queue = [];
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
    this.isProcessingQueue = false;
    this.onEndGlobal = undefined;
  }

  isActive() {
    return this.isPlaying || this.queue.length > 0;
  }
}
