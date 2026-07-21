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
  chatHistory?: any[]
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
  const trimmed = raw.trim()
  const input = trimmed.toLowerCase()

  ctx.addLog?.("Interpreting intent...", "system")

  // Fast Path: Functional / Local Commands
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
  
  if (input.startsWith("add todo") || input.startsWith("remind me")) {
    const todoTask = trimmed.replace(/^(add todo|remind me to)\s+/i, "");
    if (todoTask && ctx.addTodo) {
       ctx.addTodo(todoTask);
       return { success: true, response: `Added ${todoTask} to your list.` };
    }
  }

  // Smart Path: Conversational AI via Gemini
  try {
    ctx.addLog?.("Routing to Conversational AI...", "system")
    
    // Process intent intercepts (Routines)
    let processedPrompt = trimmed;
    if (input.includes("good morning")) {
      ctx.addLog?.("Running Good Morning Routine...", "system")
      const todos = ctx.getTodos?.() || []
      const weather = ctx.getCurrentWeather ? await ctx.getCurrentWeather() : "Weather unavailable."
      processedPrompt = `The user just said "Good morning". Act as their personalized assistant. 
      Acknowledge them, read their current weather: ${weather}, 
      and tell them about their to-dos: ${todos.length > 0 ? todos.join(', ') : "No to-dos"}. 
      Keep it conversational, cheerful, and brief.`
    }

    // Check if running on client or server to form correct URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    
    const res = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        prompt: processedPrompt,
        history: ctx.chatHistory || [],
        imageBase64: ctx.imageBase64
      }),
    })

    if (res.ok && res.body) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      let buffer = ""
      let sentenceBuffer = ""
      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() || "" // Keep incomplete chunk in buffer
        
        for (const chunk of chunks) {
          if (chunk.startsWith('data: ')) {
            const dataStr = chunk.substring(6)
            if (dataStr.trim() === '[DONE]') continue
            
            try {
              const data = JSON.parse(dataStr)
              
              if (data.event) {
                // Structured Event Payload
                ctx.onServerEvent?.(data.event, data.payload)
                
                if (data.event === 'text_stream' && data.payload.text) {
                  const chunkText = data.payload.text
                  sentenceBuffer += chunkText
                  fullResponse += chunkText
                  
                  // Match sentences by punctuation
                  const sentenceMatch = sentenceBuffer.match(/^(.*?[.!?]+)(\s+.*)?$/s)
                  if (sentenceMatch) {
                    const sentence = sentenceMatch[1]
                    const remainder = sentenceMatch[2] || ""
                    
                    // ctx.speak(sentence.trim())
                    
                    sentenceBuffer = remainder.trimStart()
                  }
                }
              } else if (data.text) {
                // Fallback for old simple text payload
                sentenceBuffer += data.text
                fullResponse += data.text
                
                // Match sentences by punctuation
                const sentenceMatch = sentenceBuffer.match(/^(.*?[.!?]+)(\s+.*)?$/s)
                if (sentenceMatch) {
                  const sentence = sentenceMatch[1]
                  const remainder = sentenceMatch[2] || ""
                  
                  // ctx.speak(sentence.trim())
                  
                  sentenceBuffer = remainder.trimStart()
                }
              }
            } catch (e) {
              console.error("Error parsing SSE data", e)
            }
          }
        }
      }
      
      // Flush remaining buffer
      // if (sentenceBuffer.trim()) {
      //   ctx.speak(sentenceBuffer.trim())
      // }
      
      return {
        success: true,
        response: fullResponse.trim(),
        handledSpeech: true 
      }
    }
  } catch (error) {
    console.error("Failed to reach conversational AI API.", error)
  }

  return {
    success: false,
    response: "I didn't understand that command, and the AI brain is currently offline."
  }
}
