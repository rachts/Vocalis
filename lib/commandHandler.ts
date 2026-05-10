import { format } from "date-fns"
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
}

export interface CommandResult {
  success: boolean
  response: string
  action?: string
  handledSpeech?: boolean
}

let globalNewsContext: { title: string, link: string, source: string }[] = []

// Keep the local regex commands for simple fallback
const commands = {
  greeting: /^(hi|hello|hey|greetings)$/i,
  time: /^(what\s+time\s+is\s+it|what'?s?\s+the\s+time|tell me the time|current time)$/i,
  // ... omitting all fallbacks but keeping basic structure to prevent complete break if python fails
}

export async function handleCommand(
  raw: string,
  ctx: CommandContext
): Promise<CommandResult> {
  const trimmed = raw.trim()

  ctx.addLog?.("Interpreting intent...", "system")

  // --- PHASE 1: Connect to the Python FastAPI Brain (Streaming JSON lines) ---
  try {
    const res = await fetch("http://localhost:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    })

    if (res.ok && res.body) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      let finalAction = ""
      let finalResponse = ""
      let finalTarget = ""
      
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        // Split by newlines (assuming backend yields JSON per line)
        const lines = buffer.split('\n')
        buffer = lines.pop() || "" // keep the last incomplete chunk in buffer
        
        for (const line of lines) {
           if (!line.trim()) continue
           try {
              const chunk = JSON.parse(line)
              
              if (chunk.status) {
                // If it's just a status update
                ctx.addLog?.(chunk.status, "system")
              }
              
              if (chunk.speech) {
                // Speak narration immediately
                ctx.speak(chunk.speech)
                finalResponse += chunk.speech + " "
              }
              
              if (chunk.action && chunk.action !== "processing") {
                 finalAction = chunk.action
                 if (chunk.target) finalTarget = chunk.target
                 ctx.addLog?.(`Executing action: ${chunk.action} on ${chunk.target || 'target'}`, "action")
              }
              
              if (chunk.url) {
                 finalTarget = chunk.url
              }
              
              if (chunk.intent === "news_fetch" && chunk.data) {
                 globalNewsContext = chunk.data;
                 chunk.data.forEach((item: any, index: number) => {
                    setTimeout(() => {
                        ctx.addLog?.(`${index + 1}. ${item.title}`, "system")
                    }, index * 800)
                 })
              }
           } catch {
              // Ignore parse errors on malformed chunks, move on
           }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
         try {
           const chunk = JSON.parse(buffer)
           if (chunk.response) finalResponse = chunk.response
           if (chunk.action) finalAction = chunk.action
           if (chunk.url) finalTarget = chunk.url
         } catch {}
      }

      // Execute Action
      if (finalAction === "open_url" && typeof window !== "undefined" && finalTarget) {
        window.open(finalTarget, "_blank")
        ctx.addLog?.(`Opened: ${finalTarget}`, "action")
      }

      return {
        success: true,
        response: finalResponse.trim(),
        action: finalAction,
        handledSpeech: true // since we handle speaking inside the loop via chunk.speech
      }
    }
  } catch (error) {
    console.error("Vocalis Python Backend is unreachable or stream failed.", error)
    ctx.addLog?.("Running locally...", "system")
  }
  // ---------------------------------------------------

  // Fallback static matches
  const input = trimmed.toLowerCase()

  if (input.includes("time")) {
    return { success: true, response: `It's ${format(new Date(), "h:mm a")}` }
  }

  if (input.includes("youtube")) {
    if (typeof window !== "undefined") window.open("https://youtube.com", "_blank")
    return { success: true, response: "Launching YouTube.", action: "open_youtube" }
  }

  if (input.includes("news")) {
    if (typeof window !== "undefined") window.open("https://news.google.com", "_blank")
    return { success: true, response: "Fetching latest news.", action: "open_news" }
  }

  if (input.includes("open first") || input.includes("open the first news")) {
    if (typeof window !== "undefined" && globalNewsContext.length > 0) {
       window.open(globalNewsContext[0].link, "_blank")
       return { success: true, response: "Launching article.", action: "open_news" }
    } else {
       return { success: false, response: "There's no active news context to open." }
    }
  }

  return {
    success: false,
    response: "That command isn't available locally."
  }
}
