export class TTSClient {
  private audioContext: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private isPlaying = false;
  private onEndGlobal?: () => void;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async speak(text: string, onEnd?: () => void, onError?: (err: any) => void) {
    if (this.isPlaying) this.stop();
    this.onEndGlobal = onEnd;

    try {
      if (!this.audioContext) {
        throw new Error("AudioContext not supported");
      }
      
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(\`\${apiUrl}/api/speak\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch TTS audio");
      }

      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.source = this.audioContext.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.connect(this.audioContext.destination);

      this.source.onended = () => {
        this.isPlaying = false;
        if (this.onEndGlobal) {
          this.onEndGlobal();
          this.onEndGlobal = undefined;
        }
      };

      this.isPlaying = true;
      this.source.start(0);
    } catch (err) {
      console.error("TTS play error", err);
      this.isPlaying = false;
      if (onError) onError(err);
    }
  }

  stop() {
    if (this.source && this.isPlaying) {
      try {
        this.source.stop();
      } catch (e) {}
    }
    this.isPlaying = false;
    this.onEndGlobal = undefined;
  }

  isActive() {
    return this.isPlaying;
  }

  // Stubs for stream methods if they are still called by context
  startStream(onEnd?: () => void, onError?: (err: any) => void) {}
  handleChunk(chunk: ArrayBuffer) {}
  endStream() {}
}
