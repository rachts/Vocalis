import { micManager } from './mic-manager';

export class VoiceActivityDetector {
  private isSpeechActive = false;
  private silenceFrames = 0;
  private speechFrames = 0;
  private checkInterval: NodeJS.Timeout | null = null;
  
  // Configuration
  private readonly VOLUME_THRESHOLD = 15; // Minimum volume level (0-100) to be considered speech
  private readonly SPEECH_START_FRAMES = 2; // Frames above threshold to trigger speech start
  private readonly SILENCE_TIMEOUT_FRAMES = 15; // Frames below threshold to trigger speech end (approx 1.5 seconds at 100ms interval)

  private onSpeechStart: (() => void) | null = null;
  private onSpeechEnd: (() => void) | null = null;

  start(onSpeechStart: () => void, onSpeechEnd: () => void) {
    this.onSpeechStart = onSpeechStart;
    this.onSpeechEnd = onSpeechEnd;
    
    this.isSpeechActive = false;
    this.silenceFrames = 0;
    this.speechFrames = 0;

    if (this.checkInterval) clearInterval(this.checkInterval);
    
    // Check every 100ms
    this.checkInterval = setInterval(() => {
      this.checkAudioLevel();
    }, 100);
  }

  private checkAudioLevel() {
    const level = micManager.getAudioLevel();

    if (level >= this.VOLUME_THRESHOLD) {
      this.silenceFrames = 0;
      this.speechFrames++;

      if (!this.isSpeechActive && this.speechFrames >= this.SPEECH_START_FRAMES) {
        this.isSpeechActive = true;
        if (this.onSpeechStart) this.onSpeechStart();
      }
    } else {
      this.speechFrames = 0;
      
      if (this.isSpeechActive) {
        this.silenceFrames++;
        
        if (this.silenceFrames >= this.SILENCE_TIMEOUT_FRAMES) {
          this.isSpeechActive = false;
          if (this.onSpeechEnd) this.onSpeechEnd();
        }
      }
    }
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isSpeechActive = false;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
  }
  
  isActive(): boolean {
    return this.isSpeechActive;
  }
}
