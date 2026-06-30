import { motion } from "framer-motion"
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react"

export function TaskPanel({ 
  plan, 
  toolExecutions 
}: { 
  plan: any | null, 
  toolExecutions: any[] 
}) {
  if (!plan) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col p-6 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md w-80 max-h-[60vh] overflow-y-auto"
    >
      <h3 className="text-white/50 text-xs font-mono font-bold tracking-widest uppercase mb-4">Current Task</h3>
      
      <div className="space-y-4">
        {plan.steps.map((step: any, index: number) => {
          const execution = toolExecutions.find(t => t.id === step.id)
          let status = 'pending'
          if (execution) {
             status = execution.status // 'running', 'success', 'error'
          }

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {status === 'pending' && <Circle className="w-4 h-4 text-white/20" />}
                {status === 'running' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm ${status === 'pending' ? 'text-white/50' : 'text-white'}`}>
                  {step.description || `Execute ${step.toolName}`}
                </span>
                {execution?.error && (
                  <span className="text-xs text-red-400 mt-1">{execution.error}</span>
                )}
                {/* Result snippet could go here, but we will use tool-cards for that */}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
