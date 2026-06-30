import { motion } from "framer-motion"

export function WorkflowGraph({ activeStage }: { activeStage: string }) {
  const stages = [
    { id: "idle", label: "Idle" },
    { id: "recording", label: "Recording" },
    { id: "transcribing", label: "Transcribing" },
    { id: "planning", label: "Planning" },
    { id: "executing", label: "Executing" },
    { id: "generating_response", label: "Synthesizing" },
    { id: "speaking", label: "Speaking" },
  ]

  let mappedStage = activeStage;
  if (mappedStage === "wake_listening") mappedStage = "idle";
  if (mappedStage === "wake_detected") mappedStage = "idle";
  if (mappedStage === "recovering") mappedStage = "planning";
  if (mappedStage === "error") mappedStage = "idle";

  const activeIndex = stages.findIndex((s) => s.id === mappedStage)

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md">
      <h3 className="text-white/50 text-xs font-mono font-bold tracking-widest uppercase mb-6">Execution Pipeline</h3>
      <div className="flex flex-col gap-2 relative">
        {stages.map((stage, i) => {
          const isActive = mappedStage === stage.id
          const isPast = activeIndex > i && activeIndex !== -1
          
          return (
            <div key={stage.id} className="flex items-center gap-4 relative z-10">
              {/* Node */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <motion.div 
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? "rgb(99, 102, 241)" : isPast ? "rgb(34, 197, 94)" : "rgba(255, 255, 255, 0.1)",
                    scale: isActive ? 1.2 : 1,
                  }}
                  className="w-4 h-4 rounded-full z-10"
                />
                {isActive && (
                  <motion.div
                    className="absolute inset-0 border border-indigo-500 rounded-full"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </div>
              
              {/* Label */}
              <motion.span 
                initial={false}
                animate={{
                  color: isActive ? "#ffffff" : isPast ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                  fontWeight: isActive ? 600 : 400
                }}
                className="text-sm tracking-wide"
              >
                {stage.label}
              </motion.span>
              
              {/* Connector Line (except for last) */}
              {i < stages.length - 1 && (
                <div className="absolute left-4 top-8 w-px h-6 bg-white/10 -translate-x-1/2 -z-10">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: isPast ? "100%" : 0 }}
                    className="w-full bg-green-500"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
