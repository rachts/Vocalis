export class WakeWordDetector {
  private recognition: any = null;
  private isListening = false;
  private onWakeWordDetected: (() => void) | null = null;

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
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        
        if (transcript.includes("vocalis") || transcript.includes("hey vocalis") || transcript.includes("jarvis")) {
          console.log(`Wake word detected: ${transcript}`);
          if (this.onWakeWordDetected) {
            this.onWakeWordDetected();
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn("WakeWord SpeechRecognition error:", event.error);
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if we are supposed to be listening
        if (this.isListening && this.recognition) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started
          }
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
      this.recognition.start();
      console.log("Listening for wake word (vocalis)...");
    } catch (error) {
      console.warn("Speech recognition already started or failed to start.");
    }
  }

  async stop() {
    if (!this.recognition || !this.isListening) return;
    this.isListening = false;
    this.recognition.stop();
    console.log("Stopped listening for wake word.");
  }

  async release() {
    this.stop();
    this.recognition = null;
    this.onWakeWordDetected = null;
  }

  isActive() {
    return this.isListening;
  }
}
