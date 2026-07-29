import { Icon } from "@/components/ui/icon"
import { MarkdownRenderer } from "./markdown-renderer"

interface AssistantResponseProps {
  content: string
  isStreaming?: boolean
}

export function AssistantResponse({ content, isStreaming = false }: AssistantResponseProps) {
  return (
    <div className="flex gap-4 px-6 pb-6">
      <Icon name="auto_awesome" className="text-sm mt-1 text-[var(--color-glow)]" />
      <div className="flex flex-col w-full">
        <div className="font-display text-[var(--color-charcoal)] leading-relaxed prose max-w-none text-lg">
          <MarkdownRenderer content={content} />
          {isStreaming && (
            <span className="streaming-text-cursor inline-block" />
          )}
        </div>
      </div>
    </div>
  )
}
