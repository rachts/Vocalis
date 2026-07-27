function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isFuzzyMatch(transcript: string, targets: string[]): { match: boolean; matchedWord?: string; score?: number } {
  const normalized = normalizeText(transcript);
  const words = normalized.split(" ");

  // Direct substring check
  for (const target of targets) {
    if (normalized.includes(target)) {
      return { match: true, matchedWord: target, score: 1.0 };
    }
  }

  // Word-by-word fuzzy Levenshtein similarity check
  for (const word of words) {
    if (word.length < 3) continue;
    for (const target of targets) {
      const dist = levenshteinDistance(word, target);
      const maxLen = Math.max(word.length, target.length);
      const similarity = (maxLen - dist) / maxLen;
      
      if (dist <= 2 || similarity >= 0.70) {
        return { match: true, matchedWord: `${word} ~ ${target}`, score: similarity };
      }
    }
  }

  return { match: false };
}

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
        console.log(`[SPEECH RECOGNITION STARTED] Lang: ${this.recognition.lang} | Continuous: ${this.recognition.continuous}`);
      };

      this.recognition.onresult = (event: any) => {
        let fullTranscript = "";
        let hasFinal = false;
        let highestConfidence = 0;

        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + " ";
          if (event.results[i][0].confidence > highestConfidence) {
            highestConfidence = event.results[i][0].confidence;
          }
          if (event.results[i].isFinal) {
            hasFinal = true;
          }
        }
        
        const cleanText = normalizeText(fullTranscript);
        const timestamp = new Date().toISOString();

        if (hasFinal) {
          console.log(`[STT FINAL] Timestamp: ${timestamp} | Confidence: ${highestConfidence.toFixed(2)} | Raw: "${cleanText}"`);
        } else {
          console.log(`[STT INTERIM] Timestamp: ${timestamp} | Confidence: ${highestConfidence.toFixed(2)} | Raw: "${cleanText}"`);
        }
        
        const targets = this.bargeInMode 
          ? ["vocalis", "jarvis", "vocalist", "vocal is", "vocals", "focalis", "localis", "vocal", "vocales", "focus", "stop", "cancel", "quiet"]
          : ["vocalis", "jarvis", "vocalist", "vocal is", "vocals", "focalis", "localis", "vocal", "vocales", "focus"];

        const result = isFuzzyMatch(cleanText, targets);

        if (result.match) {
          console.log(`[WAKE WORD DETECTED] Matched: "${result.matchedWord}" (Score: ${result.score?.toFixed(2)}) in transcript: "${cleanText}"`);
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
