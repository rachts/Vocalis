interface SpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  maxRetries?: number
}

interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

export class SpeechRecognitionWrapper {
  private recognition: SpeechRecognition | null = null
  private isActive = false
  private retryCount = 0
  private maxRetries: number

  constructor(options: SpeechRecognitionOptions = {}) {
    this.maxRetries = options.maxRetries || 3

    if (typeof window === "undefined") {
      return
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognitionAPI) {
      return
    }

    this.recognition = new SpeechRecognitionAPI()
    this.recognition.continuous = options.continuous || false
    this.recognition.interimResults = options.interimResults || false
    this.recognition.lang = options.lang || "en-US"
  }

  isAvailable(): boolean {
    return this.recognition !== null
  }

  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError("Speech recognition not supported")
      return
    }

    if (this.isActive) {
      return
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      
      onResult({
        transcript,
        isFinal: result.isFinal,
        confidence: result[0].confidence
      })
      
      this.retryCount = 0
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isActive = false
      
      if (event.error === "no-speech" && this.retryCount < this.maxRetries) {
        this.retryCount++
        onError(`No speech detected. Retry ${this.retryCount}/${this.maxRetries}`)
        setTimeout(() => this.start(onResult, onError), 1000)
        return
      }
      
      if (event.error === "network") {
        onError("Network error. Please check your connection.")
      } else {
        onError(`Speech recognition error: ${event.error}`)
      }
      
      this.retryCount = 0
    }

    this.recognition.onend = () => {
      this.isActive = false
    }

    try {
      this.recognition.start()
      this.isActive = true
    } catch (err) {
      onError("Failed to start speech recognition")
      this.isActive = false
    }
  }

  stop(): void {
    if (this.recognition && this.isActive) {
      this.recognition.stop()
      this.isActive = false
      this.retryCount = 0
    }
  }

  cleanup(): void {
    if (this.recognition) {
      this.recognition.abort()
      this.isActive = false
      this.retryCount = 0
    }
  }
}

declare global {
  interface Window {
    SpeechRecognition?: any
    webkitSpeechRecognition?: any
  }
}
