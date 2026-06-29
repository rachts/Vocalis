"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, SquareTerminal, Settings, Eye, EyeOff } from "lucide-react"
import { AIOrb } from "@/components/ai-orb"
import { TerminalLogs } from "@/components/terminal-logs"
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"
import type { OrbState } from "@/components/ai-orb"

export default function JarvisInterface() {
  const [mounted, setMounted] = useState(false)
  const { isListening, isSpeaking, startListening, stopListening, logs, processTextCommand, isScreenShared, startScreenShare } = useVoiceAssistant()
  const [isTextMode, setIsTextMode] = useState(false)
  const [textInput, setTextInput] = useState("")

  // Compute Orb state
  let orbState: OrbState = "idle"
  if (isListening) orbState = "listening"
  else if (isSpeaking) orbState = "speaking"
  // If there's an action running but neither speaking nor listening, it's processing. We'll derive this loosely if logs indicate processing.
  else if (logs.length > 0 && ["system", "action"].includes(logs[logs.length - 1].type) && !logs[logs.length - 1].text.includes("Task completed") && !logs[logs.length - 1].text.includes("Failed")) {
    orbState = "processing"
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return
    const cmd = textInput
    setTextInput("")
    await processTextCommand(cmd)
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] text-foreground overflow-hidden selection:bg-primary/30 flex flex-col items-center justify-center">
       {/* Background ambient light */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

       {/* Mode Toggle & Settings Header */}
       <header className="absolute top-6 w-full px-8 flex justify-between items-center z-50">
         <div className="flex items-center gap-2 text-white/50 text-xs font-mono font-bold tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Vocalis Core Online
         </div>
         <div className="flex items-center gap-4">
           {/* Vision Toggle */}
           <button 
             onClick={() => !isScreenShared && startScreenShare()}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/10 bg-black/40 transition-colors ${
               isScreenShared 
                 ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] border-primary/50" 
                 : "text-foreground/50 hover:text-foreground/80"
             }`}
           >
             {isScreenShared ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
             Vision {isScreenShared ? "On" : "Off"}
           </button>

           {/* Mode Toggle */}
           <div className="glass-panel px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-3 border border-white/10 bg-black/40">
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
           
           <button className="text-white/40 hover:text-white transition-colors">
             <Settings className="w-5 h-5" />
           </button>
         </div>
       </header>

       {/* Central AI Orb */}
       <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full">
          <AIOrb state={orbState} />
          
          <div className="mt-12 h-16 flex flex-col items-center justify-center">
            {isTextMode ? (
              <form onSubmit={handleTextSubmit} className="w-full max-w-md relative">
                <input 
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type command explicitly..."
                  className="w-full bg-black/40 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-primary/50 text-center font-mono placeholder:text-white/20 transition-all font-medium"
                />
              </form>
            ) : (
              <button
                onClick={() => {
                   if (isListening) stopListening()
                   else startListening()
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-xl ${
                  isListening
                    ? "bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30"
                    : "bg-primary text-white border border-primary hover:bg-primary/90 glow-primary"
                }`}
              >
                <Mic className="w-4 h-4" />
                {isListening ? "Stop Listening" : "Initialize Voice"}
              </button>
            )}
          </div>
       </div>

       {/* Terminal Floating Panel */}
       <div className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-[450px] z-50">
          <TerminalLogs logs={logs} />
       </div>
    </div>
  )
}
