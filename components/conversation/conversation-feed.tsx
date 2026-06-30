import React, { useEffect, useRef } from 'react'
import { useVoiceAssistant } from '@/contexts/voice-assistant-context'
import { UserPrompt } from './user-prompt'
import { AssistantResponse } from './assistant-response'
import { ExecutionTimeline } from './execution-timeline'
import { ExecutionNodeViz } from './execution-node-viz'

export function ConversationFeed() {
  const { chatHistory, fsmState: state, toolExecutions } = useVoiceAssistant()
  const endOfFeedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (endOfFeedRef.current) {
      endOfFeedRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory, state, toolExecutions])

  // We consider an active execution to be when state is one of the active processing states
  const isActive = ['recording', 'transcribing', 'planning', 'executing', 'generating_response'].includes(state)
  
  // Show execution timeline if we have any active tools, or if we are actively planning/executing
  const showTimeline = toolExecutions.length > 0 && (isActive || toolExecutions.some(t => t.status === 'running'))

  // Show the visual node graph when we finish generating the response or are speaking
  // (In a real app, this could be triggered by an event like plan_completed)
  const showNodeViz = state === 'speaking' || state === 'idle'

  return (
    <div className="w-full max-w-3xl flex flex-col gap-lg pb-32">
      {chatHistory.map((msg, idx) => {
        const content = msg.parts.map((p: any) => p.text).join('\n')
        const isLastModelMsg = msg.role === 'model' && idx === chatHistory.length - 1
        const isStreaming = isLastModelMsg && state === 'generating_response'
        
        return (
          <div key={idx} className="flex flex-col gap-sm">
            {msg.role === 'user' ? (
              <UserPrompt content={content} />
            ) : (
              <AssistantResponse content={content} isStreaming={isStreaming} />
            )}
            
            {isLastModelMsg && showNodeViz && (
              <div className="pl-10">
                <ExecutionNodeViz />
              </div>
            )}
          </div>
        )
      })}
      
      {showTimeline && (
        <ExecutionTimeline toolExecutions={toolExecutions} />
      )}
      
      <div ref={endOfFeedRef} />
    </div>
  )
}
