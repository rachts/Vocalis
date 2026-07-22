"use client"

import { useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"
import { TopNavBar } from "./top-nav"
import { SideNavBar } from "./side-nav"
import { BottomNavMobile } from "./bottom-nav-mobile"
import { RightContextPanel } from "./right-context-panel"
import { TerminalLogs } from "@/components/terminal-logs"
import { DeveloperDiagnostics } from "@/components/developer-diagnostics"
import { VoiceStressTester } from "@/components/voice-stress-tester"
import { AgentDashboard } from "@/components/agent-dashboard"
import { SmoothScrollProvider } from "@/components/smooth-scroll"

export interface AppShellProps {
  children: React.ReactNode
  isTextMode: boolean
  setIsTextMode: (value: boolean) => void
  showTerminal: boolean
  setShowTerminal: (value: boolean) => void
  hideRightPanel?: boolean
}

export function AppShell({ 
  children,
  isTextMode,
  setIsTextMode,
  showTerminal,
  setShowTerminal,
  hideRightPanel
}: AppShellProps) {
  const { 
    isListening, 
    startListening, 
    stopListening, 
    logs, 
    isScreenShared, 
    startScreenShare,
    toolExecutions,
    isOnline
  } = useVoiceAssistant()

  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Premium staggered entrance for main UI elements
    gsap.fromTo(".main-content-anim", 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.4,
        clearProps: "transform"
      }
    )
  }, { scope: container })

  return (
    <div ref={container} className="fixed inset-0 bg-surface-dim text-on-surface overflow-hidden selection:bg-primary/30 flex flex-col font-body-md text-body-md">
       <TopNavBar 
          isTextMode={isTextMode}
          setIsTextMode={setIsTextMode}
          isScreenShared={isScreenShared}
          startScreenShare={startScreenShare}
          showTerminal={showTerminal}
          setShowTerminal={setShowTerminal}
          isOnline={isOnline}
       />
       <SideNavBar />

       <main className="main-content-anim flex-1 flex flex-col md:flex-row h-full w-full pt-[72px] md:pl-64 z-10 relative bg-surface-dim">
          <SmoothScrollProvider className={`flex-1 flex flex-col items-center justify-start overflow-y-auto relative ${hideRightPanel ? '' : 'p-margin-mobile md:p-margin-desktop'}`}>
             {children}
          </SmoothScrollProvider>
          {!hideRightPanel && <RightContextPanel toolExecutions={toolExecutions} />}
       </main>


       <BottomNavMobile 
         isTextMode={isTextMode}
         setIsTextMode={setIsTextMode}
         isListening={isListening}
         startListening={startListening}
         stopListening={stopListening}
       />

       {/* Terminal Logs Overlay */}
       <AnimatePresence>
         {showTerminal && (
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-8 right-8 md:left-auto md:right-8 md:w-[450px] z-[60]"
            >
              <TerminalLogs logs={logs} />
           </motion.div>
         )}
       </AnimatePresence>

       {/* Hidden utility components */}
       <DeveloperDiagnostics />
       <VoiceStressTester />
       <AgentDashboard />
    </div>
  )
}
