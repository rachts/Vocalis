"use client"

import { useState, useEffect } from "react"
import { AIOrb } from "@/components/ai-orb"
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"
import type { OrbState } from "@/components/ai-orb"
import { ConversationFeed } from "@/components/conversation/conversation-feed"
import { DateTime } from "@/components/DateTime"
import { SearchBar } from "@/components/SearchBar"
import { DigestCard } from "@/components/DigestCard"
import { TodoList } from "@/components/TodoList"

export default function JarvisInterface() {
  const [mounted, setMounted] = useState(false)
  const { 
    fsmState,
    processTextCommand, 
    startListening,
    stopListening,
    isListening
  } = useVoiceAssistant()

  const orbState: OrbState | string = fsmState;

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSearch = async (query: string) => {
    await processTextCommand(query)
  }

  return (
    <div className="flex w-full h-full p-8 gap-8 overflow-hidden">
      {/* Left Sidebar - Utilities */}
      <div className="flex flex-col w-1/4 min-w-[300px] h-full justify-between pt-8 pb-12 opacity-90">
        <DateTime />
        <div className="mt-12">
          <DigestCard />
        </div>
        <div className="mt-auto">
          <TodoList />
        </div>
      </div>

      {/* Main Center - Orb & Search */}
      <div className="flex flex-col flex-1 items-center justify-center relative">
        <div 
          className={\`w-64 h-64 md:w-80 md:h-80 relative mb-12 flex-shrink-0 float-anim cursor-pointer transition-transform hover:scale-105 \${isListening ? 'scale-105' : ''}\`}
          onClick={() => {
             if (fsmState === "idle" || fsmState === "error") startListening();
             else if (isListening) stopListening();
          }}
        >
          <AIOrb state={orbState} />
        </div>

        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Right Sidebar - Conversation */}
      <div className="flex flex-col w-1/3 min-w-[350px] h-full bg-[var(--color-paper)]/50 rounded-[32px] overflow-hidden border border-[var(--color-parchment)] shadow-sm">
        <ConversationFeed />
      </div>
    </div>
  )
}
