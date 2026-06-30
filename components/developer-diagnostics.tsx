"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Radio, Wifi, Zap, X, Clock, HardDrive, List } from "lucide-react"
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"
import { micManager } from "@/lib/audio/mic-manager"

export function DeveloperDiagnostics() {
  const [isOpen, setIsOpen] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const { fsmState, isOnline, error, executionTimeline } = useVoiceAssistant()
  const [activeJobs, setActiveJobs] = useState<any[]>([])
  
  // Latency tracking
  const [latencies, setLatencies] = useState({
    wakeToSTT: 0,
    sttToPlan: 0,
    planToExec: 0,
    execToTTS: 0,
    total: 0
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setAudioLevel(micManager.getAudioLevel())
      if ((performance as any).memory) {
        setMemoryUsage(Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024))
      }

      fetch('/api/jobs')
        .then(r => r.json())
        .then(d => {
           if (d.jobs) setActiveJobs(d.jobs);
        })
        .catch(() => {});
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen])

  // Calculate latencies from timeline
  useEffect(() => {
    if (executionTimeline.length < 2) return;
    
    // Simple latency extraction based on state change timestamps
    const getTimestamp = (stateRegex: RegExp) => {
       const ev = [...executionTimeline].reverse().find(e => stateRegex.test(e.text));
       return ev ? new Date(ev.timestamp).getTime() : 0;
    }

    const tIdle = getTimestamp(/State: idle/);
    const tWake = getTimestamp(/State: wake_detected|State: recording/);
    const tSTT = getTimestamp(/State: transcribing/);
    const tPlan = getTimestamp(/State: planning/);
    const tExec = getTimestamp(/State: executing/);
    const tGen = getTimestamp(/State: generating_response/);
    const tSpeak = getTimestamp(/State: speaking/);

    // Only update if we are moving forward in the pipeline
    if (tWake > 0 && tSTT > tWake) {
       setLatencies(prev => ({
         ...prev,
         wakeToSTT: tSTT - tWake,
         sttToPlan: tPlan > tSTT ? tPlan - tSTT : prev.sttToPlan,
         planToExec: tExec > tPlan ? tExec - tPlan : prev.planToExec,
         execToTTS: tSpeak > tGen ? tSpeak - Math.max(tExec, tGen) : prev.execToTTS,
         total: tSpeak > tWake ? tSpeak - tWake : prev.total
       }))
    }
  }, [executionTimeline, fsmState])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bottom-6 right-6 w-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl z-[100] font-mono text-xs text-white overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10 shrink-0">
             <div className="flex items-center gap-2 font-bold tracking-wider text-white/50 uppercase">
               <Zap className="w-3 h-3 text-yellow-500" /> Dev Diagnostics
             </div>
             <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
               <X className="w-4 h-4" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {/* Core Status */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/40 flex items-center gap-2"><Activity className="w-3 h-3"/> FSM State</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fsmState === 'idle' ? 'bg-white/10 text-white/70' : fsmState === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                   {fsmState}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/40 flex items-center gap-2"><Radio className="w-3 h-3"/> Audio Level</span>
                <span className="text-white/80">{audioLevel}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-75 ${audioLevel > 15 ? 'bg-green-500' : 'bg-white/30'}`}
                   style={{ width: `${audioLevel}%` }}
                 />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/40 flex items-center gap-2"><Wifi className="w-3 h-3"/> Connection</span>
                <span className={`flex items-center gap-1.5 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {memoryUsage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/40 flex items-center gap-2"><HardDrive className="w-3 h-3"/> Heap Usage</span>
                  <span className="text-white/80">{memoryUsage} MB</span>
                </div>
              )}
            </div>

            {/* Latency Metrics */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="text-white/50 flex items-center gap-2 mb-2 font-bold uppercase"><Clock className="w-3 h-3"/> Latencies (ms)</div>
              
              <div className="flex justify-between">
                <span className="text-white/40">Wake ➔ STT</span>
                <span>{latencies.wakeToSTT}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">STT ➔ Plan</span>
                <span>{latencies.sttToPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Plan ➔ Exec</span>
                <span>{latencies.planToExec}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Exec ➔ TTS</span>
                <span>{latencies.execToTTS}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-1 mt-1 font-bold">
                <span className="text-white/60">Total Response</span>
                <span className="text-green-400">{latencies.total}</span>
              </div>
            </div>

            {/* Background Jobs */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="text-white/50 flex items-center gap-2 mb-2 font-bold uppercase"><Activity className="w-3 h-3"/> Background Jobs</div>
              <div className="bg-black/50 p-2 rounded border border-white/5 space-y-2">
                {activeJobs.length === 0 ? (
                  <div className="text-white/30 italic">No active background jobs.</div>
                ) : (
                  activeJobs.map((job: any) => (
                    <div key={job.id} className="flex justify-between items-center text-[10px]">
                      <span className="text-white/70 truncate w-32" title={job.name}>{job.name}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        job.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-400' :
                        job.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        job.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timeline Replay */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="text-white/50 flex items-center gap-2 mb-2 font-bold uppercase"><List className="w-3 h-3"/> Timeline Events (Last 10)</div>
              <div className="bg-black/50 p-2 rounded border border-white/5 space-y-1">
                {executionTimeline.slice(-10).map((ev, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-white/30 shrink-0">{new Date(ev.timestamp).toISOString().split('T')[1].substring(0,8)}</span>
                    <span className="text-white/70 truncate" title={ev.text}>{ev.text}</span>
                  </div>
                ))}
                {executionTimeline.length === 0 && <div className="text-white/30 italic">No events recorded yet.</div>}
              </div>
            </div>

            {error && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                {error}
              </div>
            )}
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
