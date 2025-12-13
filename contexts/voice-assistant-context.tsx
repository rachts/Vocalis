"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { SpeechRecognitionWrapper } from "@/lib/speechRecognition"
import { TextToSpeechWrapper } from "@/lib/tts"
import { handleCommand, type CommandContext } from "@/lib/commandHandler"

interface VoiceAssistantContextType {
  isListening: boolean
  isSpeaking: boolean
  lastCommand: string
  response: string
  error: string | null
  isOnline: boolean
  startListening: () => void
  stopListening: () => void
  processTextCommand: (text: string) => Promise<void>
  speak: (text: string) => void
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | null>(null)

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [response, setResponse] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  
  const recognitionRef = useRef<SpeechRecognitionWrapper | null>(null)
  const ttsRef = useRef<TextToSpeechWrapper | null>(null)
  const lastResponseRef = useRef<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return

    recognitionRef.current = new SpeechRecognitionWrapper({
      continuous: false,
      interimResults: false,
      lang: "en-US",
      maxRetries: 3,
    })

    ttsRef.current = new TextToSpeechWrapper()

    const handleOnline = () => {
      setIsOnline(true)
      setError(null)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setError("You are offline. Please check your internet connection.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      recognitionRef.current?.cleanup()
      ttsRef.current?.cancel()
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!ttsRef.current?.isAvailable()) {
      setError("Text-to-speech not supported")
      return
    }

    ttsRef.current.speak(
      text,
      {},
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (err) => setError(err)
    )
  }, [])

  const getTodos = useCallback(() => {
    const saved = localStorage.getItem("vocalis-todos")
    return saved ? JSON.parse(saved) : []
  }, [])

  const clearTodos = useCallback(() => {
    localStorage.setItem("vocalis-todos", JSON.stringify([]))
    window.dispatchEvent(new Event("storage"))
  }, [])

  const addTodo = useCallback((title: string) => {
    const todos = getTodos()
    const newTodo = {
      id: Date.now(),
      title,
      description: "Added via voice command",
      completed: false,
    }
    localStorage.setItem("vocalis-todos", JSON.stringify([...todos, newTodo]))
    window.dispatchEvent(new Event("storage"))
  }, [getTodos])

  const processTextCommand = useCallback(async (text: string) => {
    setLastCommand(text)
    setError(null)

    const ctx: CommandContext = {
      speak,
      addTodo,
      getTodos,
      clearTodos,
      lastResponse: lastResponseRef.current,
      getCurrentWeather: async () => "It's currently 27°C and sunny in your location.",
    }

    const result = await handleCommand(text, ctx)
    setResponse(result.response)
    lastResponseRef.current = result.response
    
    if (result.success) {
      speak(result.response)
    } else {
      speak(result.response)
    }
  }, [speak, addTodo, getTodos, clearTodos])

  const startListening = useCallback(() => {
    if (!recognitionRef.current?.isAvailable()) {
      setError("Speech recognition not supported in this browser")
      return
    }

    if (isListening) return

    setIsListening(true)
    setError(null)

    recognitionRef.current.start(
      (result) => {
        if (result.isFinal) {
          processTextCommand(result.transcript)
          setIsListening(false)
        }
      },
      (err) => {
        setError(err)
        setIsListening(false)
      }
    )
  }, [isListening, processTextCommand])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return (
    <VoiceAssistantContext.Provider
      value={{
        isListening,
        isSpeaking,
        lastCommand,
        response,
        error,
        isOnline,
        startListening,
        stopListening,
        processTextCommand,
        speak,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  )
}

export function useVoiceAssistant() {
  const context = useContext(VoiceAssistantContext)
  if (!context) {
    throw new Error("useVoiceAssistant must be used within a VoiceAssistantProvider")
  }
  return context
}
