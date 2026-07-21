"use client"

import { useState, useEffect } from "react"
import { AIOrb } from "@/components/ai-orb"
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"
import type { OrbState } from "@/components/ai-orb"
import { ConversationFeed } from "@/components/conversation/conversation-feed"
import { AppShell } from "@/components/layout/app-shell"

export default function JarvisInterface() {
  const [mounted, setMounted] = useState(false)
  const { 
    fsmState,
    processTextCommand, 
    startListening,
    stopListening,
    isListening
  } = useVoiceAssistant()
  
  const [isTextMode, setIsTextMode] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [showTerminal, setShowTerminal] = useState(false)

  const orbState: OrbState | string = fsmState;

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
    <AppShell 
      isTextMode={isTextMode}
      setIsTextMode={setIsTextMode}
      showTerminal={showTerminal}
      setShowTerminal={setShowTerminal}
    >
      {/* AI Orb Central Anchor */}
      <div 
        className={`w-64 h-64 md:w-96 md:h-96 relative mt-xl mb-lg flex-shrink-0 float-anim cursor-pointer transition-transform hover:scale-105 ${isListening ? 'scale-105' : ''}`}
        onClick={() => {
           if (fsmState === "idle" || fsmState === "error") startListening();
           else if (isListening) stopListening();
        }}
      >
          <AIOrb state={orbState} />
      </div>

      {/* Input Overlay for Text Mode */}
      {isTextMode && (
        <div className="w-full max-w-md relative mb-xl z-20">
          <form onSubmit={handleTextSubmit} className="w-full">
            <input 
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type command explicitly..."
              className="w-full bg-black/40 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-primary/50 text-center font-mono placeholder:text-white/20 transition-all font-medium"
            />
          </form>
        </div>
      )}

      {/* Streaming Conversational Feed */}
      <ConversationFeed />
    </AppShell>
  )
}

