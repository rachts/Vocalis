"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { WakeWordDetector } from "@/lib/audio/wakeWord"
import { StreamingSTT } from "@/lib/audio/stt"
import { TTSClient } from "@/lib/audio/tts"
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
  isScreenShared: boolean
  startScreenShare: () => Promise<void>
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
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [isScreenShared, setIsScreenShared] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const wakeWordRef = useRef<WakeWordDetector | null>(null)
  const sttRef = useRef<StreamingSTT | null>(null)
  const ttsRef = useRef<TTSClient | null>(null)
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

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!ttsRef.current) return;
    
    setIsSpeaking(true);
    ttsRef.current.speak(text, () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    }, (err) => {
      setIsSpeaking(false);
      setError("TTS Error: " + err.message);
      if (onEnd) onEnd();
    });
  }, [])

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (!videoRef.current) {
        videoRef.current = document.createElement("video");
      }
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsScreenShared(true);
      addLog("Screen sharing started. Vision active.", "system");
      
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenShared(false);
        addLog("Screen sharing ended.", "system");
      };
    } catch (e) {
      console.error("Screen share error", e);
    }
  }, [addLog]);

  const captureScreenFrame = useCallback(() => {
    if (!isScreenShared || !videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;
    
    // Scale down the image so we don't send huge base64 payload
    canvas.width = 640;
    canvas.height = (video.videoHeight / video.videoWidth) * 640;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.5); // 50% quality JPEG
  }, [isScreenShared]);

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
    
    addLog(text, "user")
    
    const userMessage = { role: "user", parts: [{ text }] };
    setChatHistory(prev => [...prev, userMessage]);

    const ctx: CommandContext = {
      speak,
      addTodo,
      getTodos,
      clearTodos,
      addLog,
      lastResponse: lastResponseRef.current,
      chatHistory: chatHistory,
      imageBase64: captureScreenFrame() || undefined,
      getCurrentWeather: async () => "It's currently 27°C and sunny in your location.",
    }

    try {
      const result = await handleCommand(text, ctx)
      
      setResponse(result.response)
      lastResponseRef.current = result.response
      
      if (result.success && result.response) {
        addLog(result.response, "system")
        playTone("done")
        const aiMessage = { role: "model", parts: [{ text: result.response }] };
        setChatHistory(prev => [...prev, aiMessage]);
      } else if (!result.success && result.response) {
        addLog(result.response, "error")
      }
      
      if (!result.handledSpeech && result.response) {
         speak(result.response)
      }
      
      // Always ensure wake word is active after returning to idle
      if (wakeWordRef.current) {
        wakeWordRef.current.start();
      }
    } catch (err: any) {
      addLog(`Internal execution error: ${err.message}`, "error")
      if (wakeWordRef.current) {
        wakeWordRef.current.start();
      }
    }
  }, [speak, addTodo, getTodos, clearTodos, addLog, playTone, chatHistory])

  const startListening = useCallback(() => {
    if (isListening) return;
    
    // Interruption logic: stop TTS if it is currently playing
    if (ttsRef.current?.isActive()) {
      ttsRef.current.stop();
      setIsSpeaking(false);
      addLog("Interrupted AI speech.", "system");
    }
    
    if (wakeWordRef.current) {
      wakeWordRef.current.stop(); // Stop wake word while actively listening
    }

    setIsListening(true)
    setError(null)
    addLog("Listening channel opened.", "system")
    playTone("start")

    if (sttRef.current) {
      sttRef.current.startListening();
    }
  }, [isListening, addLog, playTone])

  const stopListening = useCallback(() => {
    if (sttRef.current) {
      sttRef.current.stopListening();
    }
    setIsListening(false)
    playTone("stop")
    
    if (wakeWordRef.current) {
      wakeWordRef.current.start(); // Resume wake word after stopping STT manually
    }
  }, [playTone])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Initialize the new hybrid audio pipeline
    wakeWordRef.current = new WakeWordDetector();
    sttRef.current = new StreamingSTT();
    ttsRef.current = new TTSClient();

    // 1. Initialize Wake Word
    wakeWordRef.current.initialize(() => {
      // On wake word detected
      addLog("Wake word detected!", "system");
      startListening(); // Trigger STT
    }, (err) => {
      console.error(err);
      addLog("Wake word initialization failed.", "error");
    }).then(() => {
      wakeWordRef.current?.start(); // Start listening for wake word by default
    });

    // 2. Initialize STT
    sttRef.current.initialize((text, isFinal) => {
      if (isFinal && text.trim()) {
        setIsListening(false);
        sttRef.current?.stopListening();
        processTextCommand(text);
      }
    }, (err) => {
      setError(err);
      setIsListening(false);
      addLog(`STT Error: ${err}`, "error");
    });

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

    addLog("Vocalis Neural Net Phase 1 initialized. Awaiting wake word.", "system")

    return () => {
      wakeWordRef.current?.release();
      sttRef.current?.disconnect();
      ttsRef.current?.stop();
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [addLog, processTextCommand, startListening])

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
        isScreenShared,
        startScreenShare,
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
