import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

interface UserPromptProps {
  content: string
}

export function UserPrompt({ content }: UserPromptProps) {
  return (
    <div className="flex gap-md opacity-80">
      <Icon name="account_circle" className="text-sm mt-1 text-primary" />
      <div className="flex flex-col gap-md w-full">
        <p className="font-body-md text-on-surface">{content}</p>
      </div>
    </div>
  )
}
