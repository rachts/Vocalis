import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"
import { StatusPill } from "@/components/ui/status-pill"

interface ToolResultProps extends React.HTMLAttributes<HTMLDivElement> {
  toolName: string
  status: "idle" | "running" | "success" | "error"
  result?: string
}

export function ToolResult({ toolName, status, result, className, ...props }: ToolResultProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-lg p-3 flex flex-col gap-2 max-w-sm border-l-2",
        status === "running" ? "border-l-primary" :
        status === "success" ? "border-l-secondary" :
        status === "error" ? "border-l-destructive" :
        "border-l-outline",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-on-surface">
          <Icon name="build" size={14} className="text-outline" />
          <span className="font-mono text-[11px] uppercase tracking-widest">{toolName}</span>
        </div>
        <StatusPill status={status} label={status} />
      </div>
      
      {result && (
        <div className="bg-black/30 rounded p-2 overflow-x-auto text-xs font-mono text-on-surface-variant mt-1 border border-white/5">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}
