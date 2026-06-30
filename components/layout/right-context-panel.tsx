import { ToolCards } from "@/components/tool-cards"
import { Icon } from "@/components/ui/icon"

interface RightContextPanelProps {
  toolExecutions: any[];
}

export function RightContextPanel({ toolExecutions }: RightContextPanelProps) {
  return (
    <aside className="hidden xl:flex flex-col w-80 glass-sidebar p-md h-full pt-[80px] border-l border-white/15">
      <h2 className="font-mono text-mono-label text-on-surface-variant tracking-widest uppercase mb-lg">Active Workflow</h2>
      
      <div className="flex flex-col gap-sm overflow-y-auto pb-32">
        <ToolCards toolExecutions={toolExecutions} />

        {/* Dummy Memory Fragment for aesthetic per Stitch design */}
        <div className="glass-panel rounded p-sm mt-md border border-white/10">
          <div className="flex items-center gap-sm text-on-surface mb-xs">
            <Icon name="memory" size={12} className="text-primary/60" />
            <span className="font-mono text-mono-data text-[10px] uppercase tracking-widest text-primary/60">CTX_FRAG</span>
          </div>
          <p className="font-mono text-body-sm text-[11px] text-on-surface-variant leading-relaxed">
            User prefers high-level summaries before detailed breakdowns for Q-reports.
          </p>
        </div>
      </div>
    </aside>
  )
}
