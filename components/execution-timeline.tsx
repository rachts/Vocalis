import { motion } from "framer-motion"
import { Clock } from "lucide-react"

export function ExecutionTimeline({ timeline }: { timeline: any[] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col p-4 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md w-80 max-h-[40vh] overflow-y-auto"
    >
      <div className="flex items-center gap-2 mb-4 text-white/50 text-xs font-mono font-bold tracking-widest uppercase">
        <Clock className="w-3 h-3" />
        <span>Execution Timeline</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {timeline.map((event, i) => {
          const time = new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })
          
          return (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-white/30 font-mono text-xs mt-0.5">{time}</span>
              <span className="text-white/80">{event.text}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
