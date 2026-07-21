export class TTSClient {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private chunkQueue: Uint8Array[] = [];
  private isAppending = false;
  private onEndGlobal?: () => void;

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
    }
  }

  startStream(onEnd?: () => void, onError?: (err: any) => void) {
    if (this.isPlaying) this.stop();
    this.onEndGlobal = onEnd;
    this.chunkQueue = [];
    this.isAppending = false;

    if (!this.audio) this.audio = new Audio();

    this.mediaSource = new MediaSource();
    this.audio.src = URL.createObjectURL(this.mediaSource);
    
    this.mediaSource.addEventListener('sourceopen', () => {
      try {
        if (MediaSource.isTypeSupported('audio/mpeg')) {
          this.sourceBuffer = this.mediaSource!.addSourceBuffer('audio/mpeg');
        } else {
          // Fallback, might not work on Safari but we try
          this.sourceBuffer = this.mediaSource!.addSourceBuffer('audio/mpeg');
        }

        this.sourceBuffer.addEventListener('updateend', () => {
          this.isAppending = false;
          this.processChunkQueue();
        });
      } catch (err) {
        console.error("Failed to create SourceBuffer", err);
        if (onError) onError(err);
      }
    });

    this.audio.onended = () => {
      if (this.onEndGlobal) {
        this.onEndGlobal();
        this.onEndGlobal = undefined;
      }
      this.isPlaying = false;
    };
    
    this.audio.onerror = (e) => {
       console.error("Audio playback error", e);
       if (onError) onError(e);
       this.isPlaying = false;
    };

    this.isPlaying = true;
    this.audio.play().catch(err => {
       console.error("Failed to play audio", err);
       if (onError) onError(err);
    });
  }

  handleChunk(chunk: ArrayBuffer) {
    this.chunkQueue.push(new Uint8Array(chunk));
    this.processChunkQueue();
  }

  private processChunkQueue() {
    if (this.isAppending || !this.sourceBuffer || this.chunkQueue.length === 0) return;
    
    if (this.mediaSource?.readyState === 'open') {
      this.isAppending = true;
      const data = this.chunkQueue.shift()!;
      try {
        this.sourceBuffer.appendBuffer(data as BufferSource);
      } catch (err) {
        console.error("Error appending buffer:", err);
        this.isAppending = false;
      }
    }
  }

  endStream() {
    const checkEnd = setInterval(() => {
      if (this.chunkQueue.length === 0 && !this.isAppending) {
        if (this.mediaSource?.readyState === 'open') {
          this.mediaSource.endOfStream();
        }
        clearInterval(checkEnd);
      }
    }, 100);
  }

  // Keep the old signature for compatibility, but just error or handle differently
  speak(text: string, onEnd?: () => void, onError?: (err: any) => void) {
    console.warn("TTSClient.speak is deprecated. Use Socket streaming instead.");
    // Fallback if still called directly
    if (onEnd) onEnd();
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.isPlaying = false;
    this.chunkQueue = [];
    this.isAppending = false;
    if (this.mediaSource?.readyState === 'open') {
      try {
        this.mediaSource.endOfStream();
      } catch (e) {}
    }
    this.onEndGlobal = undefined;
  }

  isActive() {
    return this.isPlaying;
  }
}
