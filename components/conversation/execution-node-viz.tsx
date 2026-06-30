import React from 'react'

export function ExecutionNodeViz() {
  return (
    <div className="glass-panel p-md rounded mt-sm flex items-center justify-between overflow-hidden relative inner-glow">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
      <div className="flex items-center gap-sm relative z-10">
        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/20">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">database</span>
        </div>
        <div className="w-8 h-[1px] bg-white/20 relative">
          <div className="absolute inset-0 bg-primary w-1/2 animate-[pulse_1s_infinite]"></div>
        </div>
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(192,193,255,0.3)]">
          <span className="material-symbols-outlined text-primary text-sm pulse-dot">model_training</span>
        </div>
        <div className="w-8 h-[1px] bg-white/20 relative">
          <div className="absolute inset-0 bg-primary w-full animate-[pulse_1.5s_infinite]"></div>
        </div>
        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/20">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">description</span>
        </div>
      </div>
      <div className="text-right relative z-10">
        <div className="font-mono text-mono-data text-primary">MODEL_COMPILED</div>
        <div className="font-mono text-body-sm text-on-surface-variant text-[10px] uppercase tracking-widest">240ms elapsed</div>
      </div>
    </div>
  )
}
