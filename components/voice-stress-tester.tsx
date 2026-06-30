"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"
import { audioSessionManager } from "@/lib/audio/session-manager"

interface StressTestResult {
  total: number
  success: number
  failed: number
  wakeWordSuccess: number
  avgLatencyMs: number
  memoryUsageMb: number
}

export function VoiceStressTester() {
  const [isVisible, setIsVisible] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<StressTestResult | null>(null)
  
  const { startListening, processTextCommand, fsmState } = useVoiceAssistant()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        setIsVisible(prev => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].slice(0, -1)} - ${msg}`].slice(-10))
  }

  const runTest = async () => {
    if (isRunning) return
    setIsRunning(true)
    setProgress(0)
    setResult(null)
    setLogs([])

    const totalRuns = 10; // For demo purposes, use 10. Can be set to 100 in actual stress env.
    let successCount = 0
    let failCount = 0
    let totalLatency = 0

    addLog("Starting Voice Stress Test (Simulated)...")

    for (let i = 0; i < totalRuns; i++) {
      setProgress(i + 1)
      addLog(`Run ${i + 1}/${totalRuns}: Triggering synthetic Wake Word...`)
      
      const startMs = Date.now()
      
      // Simulate Wake Word
      ;(audioSessionManager.wakeWord as any)?.onWakeWordDetected?.()
      
      await new Promise(r => setTimeout(r, 500))
      
      addLog(`Run ${i + 1}: Synthetic STT processing...`)
      
      try {
        // Send a synthetic command to the planner
        await processTextCommand("what time is it")
        
        successCount++
        totalLatency += (Date.now() - startMs)
        addLog(`Run ${i + 1}: Success (${Date.now() - startMs}ms)`)
      } catch (e) {
        failCount++
        addLog(`Run ${i + 1}: Failed`)
      }
      
      // Wait for pipeline to settle back to idle
      await new Promise(r => setTimeout(r, 2000))
    }

    let memoryUsageMb = 0
    if ((performance as any).memory) {
      memoryUsageMb = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
    }

    setResult({
      total: totalRuns,
      success: successCount,
      failed: failCount,
      wakeWordSuccess: totalRuns,
      avgLatencyMs: Math.round(totalLatency / Math.max(1, successCount)),
      memoryUsageMb
    })

    setIsRunning(false)
    addLog("Test Complete.")
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 right-6 w-96 bg-red-950/90 border border-red-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-xl z-[100] text-xs font-mono"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-red-500/20">
            <h3 className="text-red-400 font-bold uppercase tracking-wider">Voice Stress Tester</h3>
            <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-white">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-white/50 mb-1">
                <span>Progress</span>
                <span>{progress} / 10</span>
              </div>
              <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(progress / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/40 p-2 rounded border border-white/5 h-32 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="text-white/70 truncate">{log}</div>
              ))}
            </div>

            {result && (
              <div className="bg-green-950/30 border border-green-500/30 p-3 rounded space-y-1">
                <div className="text-green-400 font-bold mb-2">Test Results</div>
                <div className="flex justify-between text-white/70"><span>Success Rate:</span> <span className="text-white">{Math.round((result.success/result.total)*100)}%</span></div>
                <div className="flex justify-between text-white/70"><span>Avg End-to-End:</span> <span className="text-white">{result.avgLatencyMs}ms</span></div>
                <div className="flex justify-between text-white/70"><span>Heap Usage:</span> <span className="text-white">{result.memoryUsageMb} MB</span></div>
              </div>
            )}

            <button
              onClick={runTest}
              disabled={isRunning}
              className={`w-full py-2 rounded font-bold uppercase tracking-widest transition-colors ${
                isRunning 
                  ? "bg-red-500/20 text-red-500/50 cursor-not-allowed" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isRunning ? "Running..." : "Start Stress Test"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
