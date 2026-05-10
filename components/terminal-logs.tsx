"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface LogEntry {
  id: string
  text: string
  type: "system" | "user" | "action" | "error"
}

export function TerminalLogs({ logs }: { logs: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div 
      className="glass-panel p-4 rounded-xl border border-white/10 w-full max-w-lg h-64 overflow-y-auto flex flex-col font-mono text-sm bg-background/60 shadow-2xl backdrop-blur-xl"
      ref={scrollRef}
    >
       <AnimatePresence initial={false}>
         {logs.map((log) => (
           <motion.div
             key={log.id}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             className={`mb-2 flex items-start gap-2 ${
               log.type === "user" ? "text-foreground/80" : 
               log.type === "action" ? "text-primary font-semibold" :
               log.type === "error" ? "text-red-400" :
               "text-foreground/50"
             }`}
           >
             <span className="shrink-0 mt-0.5 text-xs opacity-50">
               {log.type === "user" ? "You >" : log.type === "system" ? "Sys >" : log.type === "error" ? "Err >" : "Act >"}
             </span>
             <span className="leading-relaxed">
                {log.text}
             </span>
           </motion.div>
         ))}
       </AnimatePresence>
       {logs.length === 0 && (
         <div className="text-foreground/30 flex h-full items-center justify-center opacity-50">
            Awaiting input...
         </div>
       )}
    </div>
  )
}
