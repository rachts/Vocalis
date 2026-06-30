import { Icon } from "@/components/ui/icon"
import { MarkdownRenderer } from "./markdown-renderer"

interface AssistantResponseProps {
  content: string
  isStreaming?: boolean
}

export function AssistantResponse({ content, isStreaming = false }: AssistantResponseProps) {
  return (
    <div className="flex gap-md">
      <Icon name="auto_awesome" className="text-sm mt-1 text-primary" />
      <div className="flex flex-col gap-md w-full">
        <div className="font-body-md text-on-surface leading-relaxed prose prose-invert max-w-none">
          <MarkdownRenderer content={content} />
          {isStreaming && (
            <span className="streaming-text-cursor inline-block" />
          )}
        </div>
      </div>
    </div>
  )
}
