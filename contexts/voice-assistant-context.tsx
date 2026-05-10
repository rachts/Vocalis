"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { SpeechRecognitionWrapper } from "@/lib/speechRecognition"
import { TextToSpeechWrapper } from "@/lib/tts"
import { handleCommand, type CommandContext } from "@/lib/commandHandler"
import type { LogEntry } from "@/components/terminal-logs"

interface VoiceAssistantContextType {
  isListening: boolean
  isSpeaking: boolean
  lastCommand: string
  response: string
  error: string | null
  isOnline: boolean
  logs: LogEntry[]
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
  const [logs, setLogs] = useState<LogEntry[]>([])
  
  const recognitionRef = useRef<SpeechRecognitionWrapper | null>(null)
  const ttsRef = useRef<TextToSpeechWrapper | null>(null)
  const lastResponseRef = useRef<string>("")

  const addLog = useCallback((text: string, type: LogEntry["type"]) => {
    setLogs(prev => {
      const updated = [...prev, { id: Math.random().toString(36).substring(7), text, type }]
      if (updated.length > 50) return updated.slice(updated.length - 50)
      return updated
    })
  }, [])

  const audioCtxRef = useRef<AudioContext | null>(null)
  
  const playTone = useCallback((type: "start" | "stop" | "done") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      if (type === "start") {
        osc.type = "sine"
        osc.frequency.setValueAtTime(440, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
      } else if (type === "stop") {
        osc.type = "sine"
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
      } else if (type === "done") {
        osc.type = "sine"
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      }
    } catch(e) {
      console.log("Audio feedback failed:", e)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    recognitionRef.current = new SpeechRecognitionWrapper({
      continuous: true, // We want continuous listening for wake words potentially or for not dropping
      interimResults: false,
      lang: "en-US",
      maxRetries: 3,
    })

    ttsRef.current = new TextToSpeechWrapper()

    const handleOnline = () => {
      setIsOnline(true)
      setError(null)
      addLog("System online. Network connection stabilized.", "system")
    }
    const handleOffline = () => {
      setIsOnline(false)
      setError("You are offline. Please check your internet connection.")
      addLog("System offline. Network connection lost.", "error")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial boot log
    addLog("Vocalis Neural Net initialized. Awaiting input.", "system")

    return () => {
      recognitionRef.current?.cleanup()
      ttsRef.current?.cancel()
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [addLog])

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!ttsRef.current?.isAvailable()) {
      setError("Text-to-speech not supported")
      if (onEnd) onEnd()
      return
    }

    ttsRef.current.speak(
      text,
      {},
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false)
        if (onEnd) onEnd()
      },
      (err) => {
        setError(err)
        if (onEnd) onEnd()
      }
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
    
    // Check for Wake word if we want to filter (simplified for demo: assume any processed text is intentional)
    addLog(text, "user")

    const ctx: CommandContext = {
      speak,
      addTodo,
      getTodos,
      clearTodos,
      addLog,
      lastResponse: lastResponseRef.current,
      getCurrentWeather: async () => "It's currently 27°C and sunny in your location.",
    }

    try {
      const result = await handleCommand(text, ctx)
      
      setResponse(result.response)
      lastResponseRef.current = result.response
      
      if (result.success && result.response) {
        addLog(result.response, "system")
        playTone("done")
      } else if (!result.success && result.response) {
        addLog(result.response, "error")
      }
      
      // If the backend already handled speaking via stream, we might not need to speak here, but we will fallback
      if (!result.handledSpeech && result.response) {
         speak(result.response)
      }
    } catch (err: any) {
      addLog(`Internal execution error: ${err.message}`, "error")
    }
  }, [speak, addTodo, getTodos, clearTodos, addLog])

  const startListening = useCallback(() => {
    if (!recognitionRef.current?.isAvailable()) {
      setError("Speech recognition not supported in this browser")
      addLog("Speech recognition API is unavailable in this environment.", "error")
      return
    }

    if (isListening) return

    setIsListening(true)
    setError(null)
    addLog("Listening channel opened.", "system")
    playTone("start")

    recognitionRef.current.start(
      (result) => {
        if (result.isFinal) {
           const transcript = result.transcript.toLowerCase().trim()
           // Basic Wake Word Filter if we want to run continuously:
           // If it starts with "hey vocalis", strip it and process. Otherwise just process (assuming push-to-talk).
           let cmd = result.transcript
           if (transcript.startsWith("hey vocalis")) {
              cmd = result.transcript.substring(11).trim()
           }
           if (cmd) {
             processTextCommand(cmd)
           }
           // Stop listening after a command is processed unless we want true continuous. For now, stop to reset state properly.
           stopListening()
        }
      },
      (err) => {
        setError(err)
        setIsListening(false)
        if (err !== "no-speech") {
          addLog(`Voice channel error: ${err}`, "error")
        }
      }
    )
  }, [isListening, processTextCommand, addLog])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    playTone("stop")
  }, [playTone])

  return (
    <VoiceAssistantContext.Provider
      value={{
        isListening,
        isSpeaking,
        lastCommand,
        response,
        error,
        isOnline,
        logs,
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
