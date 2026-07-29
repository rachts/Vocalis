import { micManager } from "./mic-manager";

export class StreamingSTT {
  private mediaRecorder: MediaRecorder | null = null;
  private isRecording = false;
  private audioChunks: Blob[] = [];
  private onTranscriptCallback?: (text: string, isFinal: boolean, confidence: number) => void;
  private onErrorCallback?: (err: string) => void;

  initialize(
    onTranscript: (text: string, isFinal: boolean, confidence: number) => void,
    onError: (err: string) => void
  ) {
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    console.log("REST-based STT initialized");
  }

  async startListening() {
    this.audioChunks = [];
    try {
      const audioStream = await micManager.acquire();
      
      // Safari fallback
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm") && MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      this.mediaRecorder = new MediaRecorder(audioStream, {
        mimeType,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        await this.processAudioBlob(audioBlob);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      console.log("Microphone recording started");
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      if (this.onErrorCallback) this.onErrorCallback("Microphone access denied");
    }
  }

  private async processAudioBlob(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(\`\${apiUrl}/api/transcribe\`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (this.onTranscriptCallback && data.transcript) {
          this.onTranscriptCallback(data.transcript, true, 1.0);
        }
      } else {
        throw new Error("Transcription failed");
      }
    } catch (e: any) {
      console.error("STT process error", e);
      if (this.onErrorCallback) this.onErrorCallback(e.message);
    }
  }

  stopListening() {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
      this.isRecording = false;
    }
    console.log("Stopped listening");
  }

  disconnect() {
    this.stopListening();
    micManager.release();
  }
}
