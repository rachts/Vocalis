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

      this.recognition.onresult = (event: any) => {
        // Prevent instant echoing triggering (debounce)
        if (Date.now() - this.lastStartTimestamp < 800) {
           return;
        }

        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        
        let wakeWordRegex = /\b(hey|hi|okay|ok)?\s*(vocalis|jarvis)\b/i;
        
        if (this.bargeInMode) {
           // When in barge-in mode, listen for "stop" and "cancel" as well
           wakeWordRegex = /\b(hey|hi|okay|ok)?\s*(vocalis|jarvis|stop|cancel|quiet)\b/i;
        }

        if (wakeWordRegex.test(transcript)) {
          console.log(`Wake word detected: ${transcript}`);
          if (this.onWakeWordDetected) {
            this.onWakeWordDetected();
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn("WakeWord SpeechRecognition error:", event.error);
          this.consecutiveFailures++;
        }
      };

      this.recognition.onend = () => {
        // Resilient auto-restart logic
        if (this.isListening) {
          // Exponential backoff for restarts if we are failing rapidly
          const backoff = Math.min(1000 * Math.pow(2, this.consecutiveFailures), 30000); // max 30s
          
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isListening && this.recognition) {
              try {
                this.recognition.start();
                this.lastStartTimestamp = Date.now();
                this.consecutiveFailures = 0; // reset on successful start
              } catch (e) {
                // Ignore already started errors
              }
            }
          }, backoff === 1000 && this.consecutiveFailures === 0 ? 100 : backoff); // Fast restart if no failures
        }
      };
      
      console.log("Web Speech Wake word detector initialized");
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
      console.log("Listening for wake word (vocalis)...");
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
