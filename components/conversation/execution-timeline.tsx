import React from 'react'
import { Icon } from '@/components/ui/icon'

interface ExecutionTimelineProps {
  toolExecutions: any[]
}

export function ExecutionTimeline({ toolExecutions }: ExecutionTimelineProps) {
  if (!toolExecutions || toolExecutions.length === 0) return null

  return (
    <div className="flex gap-md">
      <Icon name="sync" className="text-tertiary-container text-sm mt-1 animate-spin" />
      <div className="flex flex-col gap-sm w-full">
        <p className="font-mono text-mono-data text-on-surface-variant uppercase tracking-widest text-xs">Planning Execution</p>
        <div className="glass-panel p-sm rounded flex flex-col gap-xs">
          {toolExecutions.map((exec) => (
            <div key={exec.id} className="flex items-center gap-2 text-sm font-mono">
              {exec.status === 'success' ? (
                <>
                  <Icon name="check" className="text-primary text-xs" />
                  <span className="opacity-80 text-on-surface">Executed {exec.toolName}</span>
                </>
              ) : exec.status === 'error' ? (
                <>
                  <Icon name="close" className="text-error text-xs" />
                  <span className="opacity-80 text-error">Failed {exec.toolName}</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"></span>
                  <span className="text-primary font-medium">Executing {exec.toolName}...</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
