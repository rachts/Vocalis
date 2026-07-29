import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

interface UserPromptProps {
  content: string
}

export function UserPrompt({ content }: UserPromptProps) {
  return (
    <div className="flex gap-4 opacity-90 px-6 pt-6">
      <Icon name="account_circle" className="text-sm mt-1 text-[var(--color-stone)]" />
      <div className="flex flex-col w-full">
        <p className="font-body text-[var(--color-stone)]">{content}</p>
      </div>
    </div>
  )
}
