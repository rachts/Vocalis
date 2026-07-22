export class WakeWordDetector {
  private recognition: any = null;
  private isListening = false;
  private onWakeWordDetected: (() => void) | null = null;
  private restartTimeout: NodeJS.Timeout | null = null;
  private consecutiveFailures = 0;

  private bargeInMode = false;
  private lastStartTimestamp = 0;

  async initialize(onWakeWordDetected: () => void, onError: (error: Error) => void) {
    try {
      this.onWakeWordDetected = onWakeWordDetected;
      
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("SpeechRecognition API is not supported in this browser.");
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log("[SPEECH RECOGNITION STARTED]");
      };

      this.recognition.onresult = (event: any) => {
        let fullTranscript = "";
        let hasFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript.toLowerCase() + " ";
          if (event.results[i].isFinal) {
            hasFinal = true;
          }
        }
        
        const cleanText = fullTranscript.trim();
        if (hasFinal) {
          console.log(`[FINAL RESULT] "${cleanText}"`);
        } else {
          console.log(`[INTERIM RESULT] "${cleanText}"`);
        }
        
        let wakeWordRegex = /(vocal|vok|jarvis|focal|localis|vocalis|vocalist|vocals|vocal is)/i;
        
        if (this.bargeInMode) {
           wakeWordRegex = /(vocal|vok|jarvis|focal|localis|vocalis|vocalist|vocals|vocal is|stop|cancel|quiet)/i;
        }

        if (wakeWordRegex.test(cleanText)) {
          console.log(`[WAKE WORD DETECTED] Match found in: "${cleanText}"`);
          if (this.onWakeWordDetected) {
            this.onWakeWordDetected();
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn("[SPEECH RECOGNITION ERROR]", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            console.error("Microphone permission denied for SpeechRecognition.");
          } else {
            this.consecutiveFailures++;
          }
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          const backoff = Math.min(500 * Math.pow(2, this.consecutiveFailures), 5000);
          
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isListening && this.recognition) {
              try {
                this.recognition.start();
                this.lastStartTimestamp = Date.now();
              } catch (e) {
                // Ignore already started errors
              }
            }
          }, this.consecutiveFailures === 0 ? 50 : backoff);
        }
      };
      
      console.log("[VOICE SYSTEM INITIALIZED] Web Speech Wake word detector ready");
    } catch (error) {
      console.error("Failed to initialize wake word detector:", error);
      onError(error as Error);
    }
  }

  async start() {
    if (!this.recognition || this.isListening) return;
    try {
      this.isListening = true;
      this.consecutiveFailures = 0;
      this.recognition.start();
      this.lastStartTimestamp = Date.now();
      console.log("[MICROPHONE READY] Listening for wake word (Vocalis/Jarvis)...");
    } catch (error) {
      console.warn("Speech recognition already started or failed to start.");
    }
  }

  async stop() {
    if (!this.recognition || !this.isListening) return;
    this.isListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    try {
      this.recognition.stop();
    } catch(e) {}
    console.log("Stopped listening for wake word.");
  }

  async release() {
    this.stop();
    this.recognition = null;
    this.onWakeWordDetected = null;
  }

  setBargeInMode(enabled: boolean) {
    this.bargeInMode = enabled;
  }

  isActive() {
    return this.isListening;
  }
}
