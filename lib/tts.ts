interface TTSOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export class TextToSpeechWrapper {
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
      this.loadVoices()
      
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices(): void {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices()
    }
  }

  isAvailable(): boolean {
    return this.synthesis !== null
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  speak(
    text: string,
    options: TTSOptions = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): void {
    if (!this.synthesis) {
      onError?.("Speech synthesis not supported")
      return
    }

    this.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang || "en-US"
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1

    utterance.onstart = () => onStart?.()
    utterance.onend = () => onEnd?.()
    utterance.onerror = () => {
      onError?.("Speech synthesis error")
      onEnd?.()
    }

    this.currentUtterance = utterance
    this.synthesis.speak(utterance)
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.currentUtterance = null
    }
  }

  setVoice(voiceName: string): void {
    const voice = this.voices.find(v => v.name === voiceName)
    if (voice && this.currentUtterance) {
      this.currentUtterance.voice = voice
    }
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking || false
  }
}

export const createTTS = () => new TextToSpeechWrapper()
