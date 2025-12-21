interface SpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  maxRetries?: number
}

interface SpeechRecognitionResultItem {
  transcript: string
  isFinal: boolean
  confidence: number
}

interface ISpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
      }
      isFinal: boolean
    }
    length: number
  }
}

interface ISpeechRecognitionErrorEvent {
  error: string
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined

  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return win.SpeechRecognition || win.webkitSpeechRecognition
}

export class SpeechRecognitionWrapper {
  private recognition: ISpeechRecognition | null = null
  private isActive = false
  private retryCount = 0
  private maxRetries: number

  constructor(options: SpeechRecognitionOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3

    if (typeof window === "undefined") return

    const SpeechRecognitionAPI = getSpeechRecognitionConstructor()
    if (!SpeechRecognitionAPI) return

    this.recognition = new SpeechRecognitionAPI()
    this.recognition.continuous = options.continuous ?? false
    this.recognition.interimResults = options.interimResults ?? false
    this.recognition.lang = options.lang ?? "en-US"
  }

  isAvailable(): boolean {
    return this.recognition !== null
  }

  start(
    onResult: (result: SpeechRecognitionResultItem) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError("Speech recognition not supported")
      return
    }

    if (this.isActive) return

    this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript

      onResult({
        transcript,
        isFinal: result.isFinal,
        confidence: result[0].confidence,
      })

      this.retryCount = 0
    }

    this.recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      this.isActive = false

      if (event.error === "no-speech" && this.retryCount < this.maxRetries) {
        this.retryCount++
        onError(`No speech detected. Retry ${this.retryCount}/${this.maxRetries}`)
        setTimeout(() => this.start(onResult, onError), 1000)
        return
      }

      onError(
        event.error === "network"
          ? "Network error. Please check your connection."
          : `Speech recognition error: ${event.error}`
      )

      this.retryCount = 0
    }

    this.recognition.onend = () => {
      this.isActive = false
    }

    try {
      this.recognition.start()
      this.isActive = true
    } catch {
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
