import { io, Socket } from "socket.io-client";

export class StreamingSTT {
  private socket: Socket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private isRecording = false;

  initialize(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void
  ) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    this.socket = io(apiUrl);

    this.socket.on("connect", () => {
      console.log("Connected to STT proxy via WebSocket");
    });

    this.socket.on("stt-ready", () => {
      console.log("Deepgram STT connection ready");
      this.startMicrophone();
    });

    this.socket.on("transcript", (data: { text: string; isFinal: boolean }) => {
      onTranscript(data.text, data.isFinal);
    });

    this.socket.on("stt-error", (err: string) => {
      console.error("STT Error from server:", err);
      onError(err);
    });
  }

  async startListening() {
    if (!this.socket) {
      console.error("STT not initialized");
      return;
    }
    this.socket.emit("start-stt");
  }

  private async startMicrophone() {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: "audio/webm",
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.socket && this.socket.connected) {
          this.socket.emit("audio-data", event.data);
        }
      };

      this.mediaRecorder.start(250); // Send audio chunks every 250ms
      this.isRecording = true;
      console.log("Microphone recording started");
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  }

  stopListening() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    if (this.socket) {
      this.socket.emit("stop-stt");
    }
    
    console.log("Stopped listening");
  }

  disconnect() {
    this.stopListening();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
