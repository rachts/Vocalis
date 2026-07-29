import { dispatchAgent } from "../agents/dispatcher";
import { Message } from "../types/agents";
import type { LogEntry } from "@/components/terminal-logs"

export interface CommandContext {
  speak: (text: string, onEnd?: () => void) => void
  addTodo?: (title: string) => void
  getTodos?: () => Array<{ id: number; title: string; completed: boolean }>
  clearTodos?: () => void
  setReminder?: (task: string, time: string) => void
  getCurrentWeather?: () => Promise<string>
  getNotifications?: () => Promise<string[]>
  searchFor?: (query: string) => Promise<void>
  addLog?: (text: string, type: LogEntry["type"]) => void
  lastResponse?: string
  currentVoice?: string
  chatHistory?: Message[]
  imageBase64?: string
  onServerEvent?: (event: string, payload: any) => void
}

export interface CommandResult {
  success: boolean
  response: string
  action?: string
  handledSpeech?: boolean
}

export async function handleCommand(
  raw: string,
  ctx: CommandContext
): Promise<CommandResult> {
  const trimmed = raw.trim();
  
  ctx.addLog?.("Dispatching intent...", "system");

  try {
    const history = ctx.chatHistory || [];
    
    const agent = await dispatchAgent(trimmed, history);
    ctx.addLog?.(\`Selected agent: \${agent.name}\`, "system");
    
    const result = await agent.run(trimmed, history);

    return {
      success: true,
      response: result.response,
      handledSpeech: true,
      action: result.action,
    };
    
  } catch (error) {
    console.error("Failed to execute command via agents.", error);
    ctx.addLog?.("Error interacting with Agent system.", "error");
    return {
      success: false,
      response: "I encountered an error while thinking about that.",
    };
  }
}
