import { io, Socket } from "socket.io-client";
import { micManager } from "./mic-manager";

export class StreamingSTT {
  private socket: Socket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private isRecording = false;
  private reconnectAttempts = 0;

  initialize(
    onTranscript: (text: string, isFinal: boolean, confidence: number) => void,
    onError: (err: string) => void
  ) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    this.socket = io(apiUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to STT proxy via WebSocket");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("STT WebSocket disconnected:", reason);
      if (reason === "io server disconnect") {
        this.socket?.connect(); // Reconnect manually if server disconnected
      }
    });

    this.socket.on("connect_error", (error) => {
      this.reconnectAttempts++;
      console.error("STT WebSocket connection error:", error);
      if (this.reconnectAttempts > 3) {
        onError("STT connection failing. Trying to reconnect...");
      }
    });

    this.socket.on("stt-ready", () => {
      console.log("Deepgram STT connection ready");
      this.startMicrophone();
    });

    this.socket.on("transcript", (data: { text: string; isFinal: boolean; confidence?: number }) => {
      console.log(`[TRANSCRIPT RECEIVED] Final: ${data.isFinal} | "${data.text}"`);
      onTranscript(data.text, data.isFinal, data.confidence || 0);
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
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
      this.isRecording = false;
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit("stop-stt");
    }
    
    // We do NOT release the micManager here because VAD might still need it 
    // or it's handled by the context cleanup. 
    
    console.log("Stopped listening");
  }

  disconnect() {
    this.stopListening();
    micManager.release(); // Fully release mic resources
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
