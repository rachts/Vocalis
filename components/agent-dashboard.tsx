"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Brain, Search, Cpu, Database, MessageSquare, X, ChevronDown, ChevronRight, Zap, RefreshCw, Trash2 } from "lucide-react"

type AgentRole = 'planner' | 'research' | 'automation' | 'memory' | 'conversation'
type AgentStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

interface HistoryEntry {
  timestamp: number
  event: string
  detail?: any
}

interface Agent {
  id: string
  role: AgentRole
  goal: string
  status: AgentStatus
  executionHistory: HistoryEntry[]
  createdAt: number
  startedAt?: number
  completedAt?: number
  result?: { success: boolean; error?: string; durationMs?: number }
}

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<AgentRole, { label: string; icon: any; color: string }> = {
  planner:      { label: 'Planner',      icon: Brain,          color: 'text-purple-400' },
  research:     { label: 'Research',     icon: Search,         color: 'text-blue-400'   },
  automation:   { label: 'Automation',   icon: Cpu,            color: 'text-orange-400' },
  memory:       { label: 'Memory',       icon: Database,       color: 'text-green-400'  },
  conversation: { label: 'Conversation', icon: MessageSquare,  color: 'text-cyan-400'   },
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; bg: string; dot: string }> = {
  IDLE:      { label: 'Idle',      bg: 'bg-white/10',         dot: 'bg-white/40'    },
  RUNNING:   { label: 'Running',   bg: 'bg-blue-500/20',      dot: 'bg-blue-400'    },
  PAUSED:    { label: 'Paused',    bg: 'bg-yellow-500/20',    dot: 'bg-yellow-400'  },
  COMPLETED: { label: 'Done',      bg: 'bg-green-500/20',     dot: 'bg-green-400'   },
  FAILED:    { label: 'Failed',    bg: 'bg-red-500/20',       dot: 'bg-red-400'     },
  CANCELLED: { label: 'Cancelled', bg: 'bg-white/5',          dot: 'bg-white/20'    },
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AgentStatus }) {
  const cfg = STATUS_CONFIG[status]
  const isRunning = status === 'RUNNING'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isRunning ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  )
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
function AgentCard({ agent, onCancel }: { agent: Agent; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const roleCfg = ROLE_CONFIG[agent.role] ?? { label: agent.role, icon: Bot, color: 'text-white/60' }
  const Icon = roleCfg.icon

  const elapsed = agent.completedAt
    ? ((agent.completedAt - agent.createdAt) / 1000).toFixed(1) + 's'
    : agent.startedAt
    ? ((Date.now() - agent.startedAt) / 1000).toFixed(0) + 's…'
    : '—'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${roleCfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold uppercase tracking-wide ${roleCfg.color}`}>{roleCfg.label}</span>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-white/70 text-xs mt-0.5 truncate" title={agent.goal}>{agent.goal}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-white/30 text-[10px] font-mono">{elapsed}</span>

          {(agent.status === 'RUNNING' || agent.status === 'PAUSED') && (
            <button
              onClick={() => onCancel(agent.id)}
              className="text-red-400/60 hover:text-red-400 transition-colors ml-1"
              title="Cancel agent"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setExpanded(v => !v)}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {agent.status === 'FAILED' && agent.result?.error && (
        <div className="text-red-400 text-[10px] bg-red-500/10 rounded px-2 py-1 font-mono">
          {agent.result.error}
        </div>
      )}

      {/* Expanded history */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 pt-2 space-y-1 font-mono text-[10px]">
              {agent.executionHistory.slice(-8).map((h, i) => (
                <div key={i} className="flex gap-2 text-white/40">
                  <span className="shrink-0">{new Date(h.timestamp).toISOString().substring(11, 19)}</span>
                  <span className="text-white/60">{h.event}</span>
                </div>
              ))}
              {agent.executionHistory.length === 0 && (
                <span className="text-white/20 italic">No history yet.</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function AgentDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<AgentStatus | 'ALL'>('ALL')

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      const data = await res.json()
      if (data.agents) setAgents(data.agents)
    } catch {}
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Poll while open
  useEffect(() => {
    if (!isOpen) return
    fetchAgents()
    const id = setInterval(fetchAgents, 2000)
    return () => clearInterval(id)
  }, [isOpen, fetchAgents])

  const handleCancel = async (agentId: string) => {
    await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
    fetchAgents()
  }

  const filtered = filter === 'ALL' ? agents : agents.filter(a => a.status === filter)

  const counts = {
    running: agents.filter(a => a.status === 'RUNNING').length,
    completed: agents.filter(a => a.status === 'COMPLETED').length,
    failed: agents.filter(a => a.status === 'FAILED').length,
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          className="fixed top-6 right-6 w-96 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[150] flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white text-sm tracking-wide">Agent Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchAgents} className="text-white/30 hover:text-white/60 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-white/10 shrink-0">
            {[
              { label: 'Running', val: counts.running, color: 'text-blue-400' },
              { label: 'Done', val: counts.completed, color: 'text-green-400' },
              { label: 'Failed', val: counts.failed, color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-white/40 text-[10px] uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 px-5 py-2 border-b border-white/10 shrink-0 overflow-x-auto">
            {(['ALL', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 transition-colors ${
                  filter === s ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Agent list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-white/30 text-sm py-12"
                >
                  <Bot className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>No agents {filter !== 'ALL' ? `with status "${filter}"` : 'yet'}.</p>
                  <p className="text-xs mt-1 text-white/20">
                    Say a complex command or POST to /api/agents/goal
                  </p>
                </motion.div>
              ) : (
                filtered.map(agent => (
                  <AgentCard key={agent.id} agent={agent} onCancel={handleCancel} />
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="px-5 py-2 border-t border-white/10 text-white/20 text-[10px] text-center shrink-0">
            Ctrl + Shift + A to toggle · Polling every 2s
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
