"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { VoiceStateMachine, type VoiceState } from "@/lib/fsm/voice-state-machine"
import { handleCommand, type CommandContext } from "@/lib/commandHandler"
import type { LogEntry } from "@/components/terminal-logs"
import { audioSessionManager } from "@/lib/audio/session-manager"
import { io, Socket } from "socket.io-client"
import { PermissionModal } from "@/components/permission-modal"

interface VoiceAssistantContextType {
  fsmState: VoiceState
  isListening: boolean // derived
  isSpeaking: boolean // derived
  lastCommand: string
  response: string
  error: string | null
  isOnline: boolean
  logs: LogEntry[]
  executionPlan: any | null
  toolExecutions: any[]
  executionTimeline: any[]
  chatHistory: any[]
  startListening: () => void
  stopListening: () => void
  processTextCommand: (text: string) => Promise<void>
  speak: (text: string) => void
  isScreenShared: boolean
  startScreenShare: () => Promise<void>
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | null>(null)

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const [fsmState, setFsmState] = useState<VoiceState>("idle")
  const fsmRef = useRef(new VoiceStateMachine("idle"))
  
  const [lastCommand, setLastCommand] = useState("")
  const [response, setResponse] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [isScreenShared, setIsScreenShared] = useState(false)

  // Phase 4 execution pipeline state
  const [executionPlan, setExecutionPlan] = useState<any | null>(null)
  const [toolExecutions, setToolExecutions] = useState<any[]>([])
  const [executionTimeline, setExecutionTimeline] = useState<any[]>([])
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const lastResponseRef = useRef<string>("")
  const audioCtxRef = useRef<AudioContext | null>(null)
  const systemSocketRef = useRef<Socket | null>(null)

  const [permissionRequest, setPermissionRequest] = useState<{ requestId: string, toolName: string, args: any } | null>(null)

  const addLog = useCallback((text: string, type: LogEntry["type"]) => {
    setLogs(prev => {
      const updated = [...prev, { id: Math.random().toString(36).substring(7), text, type }]
      if (updated.length > 50) return updated.slice(updated.length - 50)
      return updated
    })
  }, [])

  // Transition helper that updates React state
  const transition = useCallback((newState: VoiceState) => {
    if (fsmRef.current.transitionTo(newState)) {
      setFsmState(newState)
      addLog(`[FSM] -> ${newState}`, "system")
      
      // Track latency timeline on transitions
      setExecutionTimeline(prev => [...prev, { timestamp: new Date().toISOString(), text: `State: ${newState}`, type: 'stage' }])
    }
  }, [addLog])

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
    transition("speaking");
    // Start Wake Word in barge-in mode so we can interrupt
    audioSessionManager.startWakeWord(true);
    
    audioSessionManager.speak(text, () => {
      transition("idle");
      audioSessionManager.startWakeWord(false); // return to normal wake word
      if (onEnd) onEnd();
    }, (err) => {
      transition("error");
      setError("TTS Error: " + err.message);
      if (onEnd) onEnd();
    });
  }, [transition])

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
    
    canvas.width = 640;
    canvas.height = (video.videoHeight / video.videoWidth) * 640;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.5);
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
      onServerEvent: (event, payload) => {
        if (event === 'stage_change') {
          if (payload.stage === 'planning') transition("planning");
          if (payload.stage === 'executing') transition("executing");
          if (payload.stage === 'generating') transition("generating_response");
        } else if (event === 'plan_created') {
          setExecutionPlan(payload.plan)
        } else if (event === 'tool_start') {
          setToolExecutions(prev => [...prev, { id: payload.id, toolName: payload.toolName, status: 'running', args: payload.args }])
        } else if (event === 'tool_end') {
          setToolExecutions(prev => prev.map(t => t.id === payload.id ? { ...t, status: payload.error ? 'error' : 'success', result: payload.result, error: payload.error } : t))
        }
      }
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
        transition("error")
      }
      
      // Speech is now handled via Socket.IO stream directly from the backend.
      // We only transition to idle if there was no response generated (e.g. silent tool execution).
      if (!result.response) {
         transition("idle")
         audioSessionManager.startWakeWord(false);
      }

    } catch (err: any) {
      addLog(`Internal execution error: ${err.message}`, "error")
      transition("error")
      setTimeout(() => {
        transition("idle")
        audioSessionManager.startWakeWord(false);
      }, 3000)
    }
  }, [speak, addTodo, getTodos, clearTodos, addLog, playTone, chatHistory, transition, captureScreenFrame])

  const stopListening = useCallback(() => {
    audioSessionManager.stopListening();
    transition("transcribing");
    playTone("stop");
  }, [playTone, transition])

  const startListening = useCallback(() => {
    if (fsmRef.current.is("recording")) return;
    
    // Interruption / Barge-in logic: stop TTS if it is currently playing
    if (fsmRef.current.is("speaking")) {
      audioSessionManager.stopSpeaking();
      addLog("Interrupted AI speech (Barge-In).", "system");
    }
    
    audioSessionManager.stopWakeWord();
    
    transition("recording");
    setError(null);
    addLog("Listening channel opened.", "system");
    playTone("start");

    audioSessionManager.startListening(
      () => console.log("VAD: Speech started"),
      () => {
        console.log("VAD: Speech ended (silence detected)");
        stopListening();
      }
    );
  }, [addLog, playTone, transition, stopListening])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Initialize Audio Session Manager
    audioSessionManager.initialize(
      () => {
        transition("wake_detected");
        addLog("Wake word detected!", "system");
        startListening();
      },
      (text, isFinal, confidence) => {
        if (isFinal && text.trim()) {
          audioSessionManager.stopListening();
          transition("transcribing");
          
          if (confidence < 0.65) {
             addLog(`Low confidence (${Math.round(confidence*100)}%). Asking for clarification.`, "system");
             speak("I didn't quite catch that. Could you repeat it?");
             return;
          }
          
          processTextCommand(text);
        }
      },
      (err) => {
        setError(err);
        transition("error");
        addLog(`STT Error: ${err}`, "error");
        setTimeout(() => {
          transition("idle");
          audioSessionManager.startWakeWord(false);
        }, 3000)
      },
      (err) => {
        console.error(err);
        addLog("Wake word initialization failed.", "error");
      }
    ).then(() => {
      transition("idle");
      audioSessionManager.startWakeWord(false);
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

    // System WebSocket for Permissions & Notifications
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    systemSocketRef.current = io(apiUrl);
    
    systemSocketRef.current.on('PermissionRequested', (payload: any) => {
      addLog(`Permission required for ${payload.toolName}. Waiting for user approval.`, 'system');
      setPermissionRequest(payload);
    });

    systemSocketRef.current.on('NotificationTriggered', (payload: any) => {
       addLog(`[Notification] ${payload.title}: ${payload.message}`, 'system');
    });

    systemSocketRef.current.on('BackgroundJobCompleted', (payload: any) => {
       addLog(`[Job] Background Job ${payload.id} completed.`, 'system');
    });

    systemSocketRef.current.on('tts_audio_chunk', (chunk: ArrayBuffer) => {
      if (!audioSessionManager.tts?.isActive()) {
        transition("speaking");
        audioSessionManager.startWakeWord(true); // barge-in mode
        audioSessionManager.startTTSStream(
          () => {
            transition("idle");
            audioSessionManager.startWakeWord(false);
          },
          (err) => {
            transition("error");
            setError("TTS Error: " + err.message);
          }
        );
      }
      audioSessionManager.handleTTSChunk(chunk);
    });

    systemSocketRef.current.on('tts_audio_end', () => {
      audioSessionManager.endTTSStream();
    });

    addLog("Vocalis OS Phase 7 initialized. Productivity tools active.", "system")

    return () => {
      audioSessionManager.releaseAll();
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (systemSocketRef.current) systemSocketRef.current.disconnect();
    }
  }, [addLog, processTextCommand, startListening, transition])

  const isListening = fsmState === "recording" || fsmState === "transcribing" || fsmState === "wake_detected"
  const isSpeaking = fsmState === "speaking"

  const handlePermissionResponse = useCallback((granted: boolean, scope: 'ONCE' | 'SESSION') => {
    if (permissionRequest && systemSocketRef.current) {
      systemSocketRef.current.emit('permission_response', {
        requestId: permissionRequest.requestId,
        toolName: permissionRequest.toolName,
        granted,
        scope
      });
      addLog(`Permission ${granted ? 'granted' : 'denied'} for ${permissionRequest.toolName} (${scope})`, 'system');
      setPermissionRequest(null);
    }
  }, [permissionRequest, addLog]);

  return (
    <VoiceAssistantContext.Provider
      value={{
        fsmState,
        isListening,
        isSpeaking,
        lastCommand,
        response,
        error,
        isOnline,
        logs,
        executionPlan,
        toolExecutions,
        executionTimeline,
        chatHistory,
        startListening,
        stopListening,
        processTextCommand,
        speak,
        isScreenShared,
        startScreenShare
      }}
    >
      {children}
      <PermissionModal
        isOpen={permissionRequest !== null}
        toolName={permissionRequest?.toolName || ""}
        args={permissionRequest?.args || {}}
        onRespond={handlePermissionResponse}
      />
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
