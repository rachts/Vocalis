import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { StatusPill } from "./status-pill"

export interface AgentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  role: string
  status?: "idle" | "running" | "success" | "error"
  description?: string
  icon?: string
}

export function AgentCard({
  name,
  role,
  status = "idle",
  description,
  icon = "smart_toy",
  className,
  ...props
}: AgentCardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 hover:border-primary/30",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-white/5">
            <Icon name={icon} className={cn(
              "text-xl",
              status === "running" ? "text-primary animate-pulse" : "text-outline"
            )} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-on-surface">{name}</h4>
            <p className="text-[11px] text-outline font-mono uppercase tracking-wider">{role}</p>
          </div>
        </div>
        <StatusPill status={status} label={status} />
      </div>
      
      {description && (
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
