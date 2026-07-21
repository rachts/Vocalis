import { micManager } from "./mic-manager";
import { WakeWordDetector } from "./wakeWord";
import { VoiceActivityDetector } from "./vad";
import { StreamingSTT } from "./stt";
import { TTSClient } from "./tts";

/**
 * AudioSessionManager is a central singleton that strictly owns the audio lifecycle.
 * It prevents duplicate AudioContexts, multiple SpeechRecognition instances, and zombie MediaStreams.
 */
class AudioSessionManager {
  public wakeWord: WakeWordDetector | null = null;
  public vad: VoiceActivityDetector | null = null;
  public stt: StreamingSTT | null = null;
  public tts: TTSClient | null = null;
  private isInitialized = false;

  async initialize(
    onWakeWordDetected: () => void,
    onTranscript: (text: string, isFinal: boolean, confidence: number) => void,
    onSTTError: (err: string) => void,
    onWakeError: (err: Error) => void
  ) {
    if (this.isInitialized) return;

    this.wakeWord = new WakeWordDetector();
    this.vad = new VoiceActivityDetector();
    this.stt = new StreamingSTT();
    this.tts = new TTSClient();

    try {
      await this.wakeWord.initialize(onWakeWordDetected, onWakeError);
      
      this.stt.initialize((text, isFinal, confidence) => {
        onTranscript(text, isFinal, confidence);
      }, onSTTError);

      this.isInitialized = true;
      console.log("Audio Session Manager strictly initialized.");
    } catch (e) {
      console.error("Audio Session Manager failed to initialize", e);
    }
  }

  async startWakeWord(bargeInMode = false) {
    if (!this.wakeWord) return;
    this.wakeWord.setBargeInMode(bargeInMode);
    await this.wakeWord.start();
  }

  stopWakeWord() {
    if (this.wakeWord) this.wakeWord.stop();
  }

  async startListening(onSpeechStart: () => void, onSpeechEnd: () => void) {
    if (!this.stt || !this.vad) return;
    
    // Request mic access first to ensure stream is ready
    try {
      await micManager.acquire();
      await this.stt.startListening();
      
      this.vad.start(onSpeechStart, onSpeechEnd);
    } catch (e) {
      console.error("Failed to start listening stream", e);
    }
  }

  stopListening() {
    if (this.stt) this.stt.stopListening();
    if (this.vad) this.vad.stop();
  }

  speak(text: string, onEnd: () => void, onError: (err: any) => void) {
    if (!this.tts) {
      onError(new Error("TTS not initialized"));
      return;
    }
    this.tts.speak(text, onEnd, onError);
  }

  startTTSStream(onEnd: () => void, onError: (err: any) => void) {
    if (!this.tts) return;
    this.tts.startStream(onEnd, onError);
  }

  handleTTSChunk(chunk: ArrayBuffer) {
    if (this.tts) this.tts.handleChunk(chunk);
  }

  endTTSStream() {
    if (this.tts) this.tts.endStream();
  }

  stopSpeaking() {

    if (this.tts) this.tts.stop();
  }

  releaseAll() {
    this.stopListening();
    this.stopSpeaking();
    this.stopWakeWord();
    
    if (this.wakeWord) this.wakeWord.release();
    if (this.stt) this.stt.disconnect();
    
    micManager.release();
    this.isInitialized = false;
  }
}

export const audioSessionManager = new AudioSessionManager();
