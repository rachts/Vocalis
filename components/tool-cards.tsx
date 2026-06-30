import React from "react"

export function ToolCards({ toolExecutions }: { toolExecutions: any[] }) {
  if (!toolExecutions || toolExecutions.length === 0) return null;

  return (
    <>
      {toolExecutions.map((execution) => {
        let icon = "terminal";
        if (execution.toolName === 'search') icon = "search";
        if (execution.toolName === 'browser') icon = "language";
        if (execution.toolName === 'calculator') icon = "calculate";
        if (execution.toolName === 'filesystem') icon = "folder_open";

        // Determine status dot color
        let statusColor = "bg-outline-variant"; // idle/unknown
        if (execution.status === 'running') statusColor = "bg-tertiary-container animate-pulse";
        if (execution.status === 'success') statusColor = "bg-primary";
        if (execution.status === 'error') statusColor = "bg-error";

        // Generate a preview text based on arguments
        let argsPreview = "STATUS: IDLE";
        if (execution.args) {
          try {
             argsPreview = "> " + JSON.stringify(execution.args).substring(0, 40) + "...";
          } catch(e) {}
        }

        const isRunning = execution.status === 'running';

        return (
          <div key={execution.id} className={`glass-panel rounded p-sm group hover:bg-white/10 transition-colors cursor-pointer border ${isRunning ? 'border-white/20 inner-glow' : 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-sm">
              <div className="flex items-center gap-sm text-on-surface">
                <span className={`material-symbols-outlined text-sm ${isRunning ? 'text-primary' : 'text-on-surface-variant'}`}>{icon}</span>
                <span className={`font-mono text-body-sm font-medium tracking-wide ${isRunning ? '' : 'opacity-60'}`}>{execution.toolName.toUpperCase()}</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
            </div>
            <div className={`font-mono text-mono-data text-xs truncate ${isRunning ? 'text-on-surface-variant' : 'text-outline opacity-60'}`}>
                {execution.status === 'error' && execution.error ? execution.error : argsPreview}
            </div>
          </div>
        )
      })}
    </>
  )
}
