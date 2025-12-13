"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { format } from "date-fns"
import { VoiceAssistant } from "@/lib/voice-assistant"

interface VoiceAssistantContextType {
  isListening: boolean
  isSpeaking: boolean
  lastCommand: string
  response: string
  error: string | null
  isOnline: boolean
  debugInfo: string[]
  startListening: () => void
  stopListening: () => void
  processTextCommand: (text: string) => Promise<void>
  speak: (text: string) => void
  cancel: () => void
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | null>(null)

const commands: Record<string, (args: string) => Promise<string>> = {
  "what time is it": async () => `It's ${format(new Date(), "h:mm a")}`,
  "what's the date": async () => `Today is ${format(new Date(), "EEEE, MMMM d, yyyy")}`,
  "what's the weather": async () => "It's currently 27°C and sunny in your location",
  "add todo": async (task) => `Added "${task}" to your todo list`,
  "set reminder": async (reminder) => `Set a reminder for "${reminder}"`,
}

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [response, setResponse] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const voiceAssistant = new VoiceAssistant()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      setError("You are offline. Please check your internet connection.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const processTextCommand = async (text: string) => {
    for (const [command, handler] of Object.entries(commands)) {
      if (text.includes(command)) {
        setLastCommand(text)
        const assistantResponse = await handler(text.replace(command, "").trim())
        setResponse(assistantResponse)
        setError(null)
        voiceAssistant.speak(assistantResponse)
        return
      }
    }
    setResponse("I'm sorry, I didn't understand that command.")
  }

  const speak = (text: string) => {
    voiceAssistant.speak(text)
  }

  const cancel = () => {
    voiceAssistant.cancel()
  }

  return (
    <VoiceAssistantContext.Provider
      value={{
        isListening,
        isSpeaking,
        lastCommand,
        response,
        error,
        isOnline,
        debugInfo,
        startListening: () => {},
        stopListening: () => {},
        processTextCommand,
        speak,
        cancel,
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
