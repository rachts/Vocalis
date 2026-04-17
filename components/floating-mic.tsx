"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Loader2, SquareTerminal } from "lucide-react"

type MicState = "idle" | "listening" | "processing" | "responding"

import { useVoiceAssistant } from "@/contexts/voice-assistant-context"

export function FloatingMic() {
  const { isListening, isSpeaking, startListening, stopListening, error } = useVoiceAssistant()
  const [isTextMode, setIsTextMode] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Derive UI state from the real context
  let state = "idle"
  if (isListening) state = "listening"
  else if (isProcessing) state = "processing"
  else if (isSpeaking) state = "responding"

  // Temporary mock processing state listener (since context doesn't expose it yet)
  useEffect(() => {
    if (isListening) setIsProcessing(true)
    if (!isListening && isSpeaking) setIsProcessing(false)
    if (!isListening && !isSpeaking) setIsProcessing(false)
  }, [isListening, isSpeaking])

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {state !== "idle" && (
          <motion.div
            key="mic-status-panel"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="glass-panel p-4 md:p-5 rounded-2xl w-[220px] md:w-[260px] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="text-sm font-medium text-foreground/90">
              {state === "listening" && "Listening..."}
              {state === "processing" && "Processing..."}
              {state === "responding" && "Executing command..."}
            </div>
            
            {/* Visualizer */}
            {state === "listening" && (
              <div className="flex gap-1 mt-3 h-6 items-center">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-primary/80 rounded-full"
                    animate={{ height: ["20%", "100%", "20%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.7,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}
            {state === "processing" && (
               <div className="flex gap-2 mt-3 items-center text-primary">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span className="text-xs text-foreground/60">AI is thinking</span>
               </div>
            )}
            {state === "responding" && (
               <div className="mt-3 text-xs text-foreground/80">
                 <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                 >
                   ✨ Success. Task completed.
                 </motion.span>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Toggle Mode */}
        <div className="hidden md:flex glass-panel px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-3 border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsTextMode(false)}
            className={`transition-colors ${!isTextMode ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-foreground/50 hover:text-foreground/80"}`}
          >
            Voice
          </button>
          <div className="w-px h-3 bg-white/20" />
          <button 
             onClick={() => setIsTextMode(true)}
             className={`flex items-center gap-1 transition-colors ${isTextMode ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-foreground/50 hover:text-foreground/80"}`}
          >
            <SquareTerminal className="w-3 h-3" /> Text
          </button>
        </div>

        {/* Mic Button */}
        <button
          onClick={() => {
             if (state === "idle") startListening()
             else stopListening()
          }}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 ease-out z-10 ${
            state === "idle"
              ? "bg-card border border-white/10 hover:border-primary/50 text-foreground/80 hover:text-white"
              : "bg-primary text-white glow-primary scale-105"
          }`}
        >
          {state === "idle" && <Mic className="w-6 h-6" />}
          {state === "listening" && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
          )}
          {state === "processing" && <Loader2 className="w-6 h-6 animate-spin text-white" />}
          {state === "responding" && <Mic className="w-6 h-6 text-white" />}

          {/* Ripple Effect */}
          {state === "listening" && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none"
              animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            />
          )}
        </button>
      </div>
    </div>
  )
}
