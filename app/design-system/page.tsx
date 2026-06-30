"use client"

import { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { StatusPill } from "@/components/ui/status-pill"
import { AgentCard } from "@/components/ui/agent-card"
import { ExecutionNode } from "@/components/ui/execution-node"
import { ToolResult } from "@/components/conversation/tool-result"
import { UserPrompt } from "@/components/conversation/user-prompt"
import { AssistantResponse } from "@/components/conversation/assistant-response"

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-surface-dim text-on-surface p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-16">
        
        <header className="border-b border-white/10 pb-8">
          <h1 className="text-display-lg font-mono tracking-tighter text-primary">Design System Showcase</h1>
          <p className="text-on-surface-variant mt-2">A unified reference for VOCALIS OS interface primitives and components.</p>
        </header>

        {/* --- Tokens & Typography --- */}
        <section className="space-y-6">
          <h2 className="text-headline-lg font-mono tracking-tight border-b border-white/10 pb-2">1. Tokens & Typography</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded bg-primary text-primary-foreground font-mono text-sm">Primary</div>
            <div className="p-4 rounded bg-secondary text-secondary-foreground font-mono text-sm">Secondary</div>
            <div className="p-4 rounded bg-destructive text-destructive-foreground font-mono text-sm">Destructive</div>
            <div className="p-4 rounded bg-surface-variant text-on-surface-variant font-mono text-sm border">Surface Variant</div>
          </div>
          
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-xs text-outline font-mono">Display Large / Inter 48px</p>
              <div className="text-display-lg">The quick brown fox</div>
            </div>
            <div>
              <p className="text-xs text-outline font-mono">Headline Large / Inter 32px</p>
              <div className="text-headline-lg">The quick brown fox</div>
            </div>
            <div>
              <p className="text-xs text-outline font-mono">Body Medium / Inter 16px</p>
              <div className="text-body-md">The quick brown fox jumps over the lazy dog.</div>
            </div>
            <div>
              <p className="text-xs text-outline font-mono">Mono Data / JetBrains Mono 13px</p>
              <div className="font-mono text-mono-data">System.out.println("Hello");</div>
            </div>
          </div>
        </section>

        {/* --- Status Pills --- */}
        <section className="space-y-6">
          <h2 className="text-headline-lg font-mono tracking-tight border-b border-white/10 pb-2">2. Status Indicators</h2>
          <div className="flex flex-wrap gap-4">
            <StatusPill status="idle" label="idle" />
            <StatusPill status="running" label="running" />
            <StatusPill status="success" label="success" />
            <StatusPill status="error" label="error" />
          </div>
        </section>

        {/* --- Domain Components --- */}
        <section className="space-y-6">
          <h2 className="text-headline-lg font-mono tracking-tight border-b border-white/10 pb-2">3. Domain Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Execution Nodes</h3>
              <ExecutionNode name="Memory Search" status="success" duration="142ms" icon="database" />
              <ExecutionNode name="Task Planner" status="running" duration="In progress..." icon="route" />
              <ExecutionNode name="Network Request" status="error" duration="Failed" icon="cloud_off" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Agent Cards</h3>
              <AgentCard 
                name="Research Agent" 
                role="Data Gatherer" 
                status="running" 
                icon="travel_explore" 
                description="Actively searching the web for latest React documentation."
              />
              <AgentCard 
                name="System Controller" 
                role="Orchestrator" 
                status="idle" 
                icon="memory" 
              />
            </div>
          </div>
        </section>

        {/* --- Conversation Feed --- */}
        <section className="space-y-6">
          <h2 className="text-headline-lg font-mono tracking-tight border-b border-white/10 pb-2">4. Conversation Components</h2>
          
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <UserPrompt content="Create a new workflow that summarizes my daily emails." />
            
            <ToolResult toolName="ReadEmails" status="success" result="[ { from: 'boss', subj: 'Q3 Report' } ]" />
            
            <AssistantResponse 
              content="I've read your emails. Here is the summary: \n\n* **Q3 Report** is due tomorrow.\n\nLet me know if you need to draft a reply." 
            />
            
            <AssistantResponse 
              content="Waiting for your confirmation to draft the reply..." 
              isStreaming={true}
            />
          </div>
        </section>

      </div>
    </div>
  )
}
