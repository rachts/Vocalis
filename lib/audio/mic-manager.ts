export class MicrophoneManager {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneNode: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;

  async acquire(): Promise<MediaStream> {
    if (this.stream) {
      return this.stream;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Setup audio context for level monitoring
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.microphoneNode = this.audioContext.createMediaStreamSource(this.stream);
      this.microphoneNode.connect(this.analyser);
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      return this.stream;
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      throw err;
    }
  }

  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray as any);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    const average = sum / this.dataArray.length;
    // Map to 0-100 scale roughly
    return Math.min(100, Math.round((average / 255) * 100 * 1.5));
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  release() {
    if (this.microphoneNode) {
      this.microphoneNode.disconnect();
      this.microphoneNode = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

// Singleton instance
export const micManager = new MicrophoneManager();
