import { cn } from "@/lib/utils"

export interface StatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "idle" | "running" | "success" | "error"
  label: string
}

export function StatusPill({ status, label, className, ...props }: StatusPillProps) {
  const statusConfig = {
    idle: "bg-surface-variant/20 text-on-surface-variant border-surface-container-highest",
    running: "bg-primary/20 text-primary border-primary/30",
    success: "bg-secondary/20 text-secondary border-secondary/30",
    error: "bg-destructive/20 text-destructive border-destructive/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border rounded-full backdrop-blur-sm",
        statusConfig[status],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "running" ? "animate-pulse bg-primary" :
          status === "success" ? "bg-secondary" :
          status === "error" ? "bg-destructive" :
          "bg-on-surface-variant"
        )}
      />
      {label}
    </div>
  )
}
