// Helper functions for speech recognition

declare global {
  interface Window {
    SpeechRecognition: any // Changed from typeof SpeechRecognition to any
    webkitSpeechRecognition: any // Changed from typeof SpeechRecognition to any
  }
}


export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
}

export function createSpeechRecognition(): SpeechRecognition | null {
  if (!isSpeechRecognitionSupported()) {
    console.error("Speech recognition is not supported in this browser")
    return null
  }

  const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognitionConstructor()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = "en-US"

  return recognition
}

export function createSpeechSynthesis(): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance()
  utterance.lang = "en-US"
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1
  return utterance
}
