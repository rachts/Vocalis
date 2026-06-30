import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { StatusPill } from "./status-pill"

export interface ExecutionNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  status: "idle" | "running" | "success" | "error"
  duration?: string
  icon?: string
}

export function ExecutionNode({
  name,
  status,
  duration,
  icon = "terminal",
  className,
  ...props
}: ExecutionNodeProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border bg-surface-dim/30 backdrop-blur-sm transition-colors",
        status === "running" ? "border-primary/40" :
        status === "success" ? "border-secondary/20" :
        status === "error" ? "border-destructive/40" :
        "border-white/5",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Icon 
          name={icon} 
          className={cn(
            "text-lg",
            status === "running" ? "text-primary" :
            status === "success" ? "text-secondary" :
            status === "error" ? "text-destructive" :
            "text-outline"
          )} 
        />
        <div className="flex-1 font-mono text-xs text-on-surface truncate">
          {name}
        </div>
        {duration && (
          <div className="text-[10px] text-outline font-mono">
            {duration}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center pl-7">
        <StatusPill status={status} label={status} />
        {status === "running" && (
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  )
}
