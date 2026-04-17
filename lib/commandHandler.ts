import { format } from "date-fns"

export interface CommandContext {
  speak: (text: string) => void
  addTodo?: (title: string) => void
  getTodos?: () => Array<{ id: number; title: string; completed: boolean }>
  clearTodos?: () => void
  setReminder?: (task: string, time: string) => void
  getCurrentWeather?: () => Promise<string>
  getNotifications?: () => Promise<string[]>
  searchFor?: (query: string) => Promise<void>
  lastResponse?: string
  currentVoice?: string
}

export interface CommandResult {
  success: boolean
  response: string
  action?: string
}

const commands = {
  greeting: /^(hi|hello|hey|greetings)$/i,
  summarize: /^(summarize|summary|explain|tell me about)\s+(.+)$/i,
  addTodo: /^(add|create|new)\s+(todo|task)\s*:?\s*(.+)$/i,
  readTodos: /^(read|show|list|what are)\s+(my\s+)?(todos|tasks|to-?do list)$/i,
  clearTodos: /^(clear|delete|remove)\s+(all\s+)?(todos|tasks|to-?do list)$/i,
  reminder: /^(remind|reminder)\s+me\s+to\s+(.+)\s+(at|on|in|by)\s+(.+)$/i,
  playMusic: /^(play|start|stream)\s+(song|music|audio|track)\s*:?\s*(.+)$/i,
  search: /^(search\s+for|find|look up|google)\s+(.+)$/i,
  weather: /^(what'?s?\s+the\s+weather|weather\s+(update|forecast|report)|how'?s?\s+the\s+weather)$/i,
  notifications: /^(read|show|check|view)\s+(my\s+)?(notifications|alerts|messages)$/i,
  changeVoice: /^(change|switch|set)\s+voice\s+to\s+(.+)$/i,
  repeat: /^(repeat|say that again|what did you say)$/i,
  time: /^(what\s+time\s+is\s+it|what'?s?\s+the\s+time|tell me the time|current time)$/i,
  date: /^(what'?s?\s+the\s+date|what\s+day\s+is\s+it|tell me the date|today'?s?\s+date)$/i,
  joke: /^(tell me a joke|joke|make me laugh|say something funny)$/i,
  fact: /^(tell me a fact|fact|random fact|interesting fact)$/i,
  help: /^(help|what can you do|commands)$/i,
  shutdown: /^(shutdown|stop|exit|quit)$/i,
  openGoogle: /^(open|launch|start)\s+google$/i,
  openYouTube: /^(open|launch|start)\s+(youtube|yt)$/i,
  openWhatsApp: /^(open|launch|start)\s+(whatsapp|whatsapp web)$/i,
  openChatGPT: /^(open|launch|start)\s+(chatgpt|chat gpt|gpt)$/i,
  searchGoogle: /^search\s+(for\s+)?(.+?)\s+on\s+google$/i,
  playASong: /^play\s+a\s+song$/i,
}

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "What do you call a fake noodle? An impasta!",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why don't eggs tell jokes? They'd crack each other up!",
]

const facts = [
  "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that's still edible!",
  "Octopuses have three hearts and blue blood.",
  "A single strand of spaghetti is called a 'spaghetto'.",
  "Bananas are berries, but strawberries aren't.",
  "The shortest war in history lasted 38 minutes between Britain and Zanzibar.",
]

export async function handleCommand(
  raw: string,
  ctx: CommandContext
): Promise<CommandResult> {
  const trimmed = raw.trim()

  // --- PHASE 1: Connect to the Python FastAPI Brain ---
  try {
    const res = await fetch("http://localhost:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    })

    if (res.ok) {
      const data = await res.json()
      
      // Execute the requested action (if any)
      if (data.action === "open_url" && typeof window !== "undefined") {
        window.open(data.url, "_blank")
      }
      
      // If Python successfully understood it, Return early.
      return {
        success: data.success,
        response: data.response || "Task executed.",
        action: data.action,
      }
    }
  } catch (error) {
    console.error("Vocalis Python Backend is unreachable. Falling back to static local handlers.", error)
  }
  // ---------------------------------------------------

  // Fallback static matches
  if (commands.greeting.test(trimmed)) {
    return {
      success: true,
      response: "Hello! How can I assist you today?",
    }
  }

  if (commands.time.test(trimmed)) {
    return {
      success: true,
      response: `It's ${format(new Date(), "h:mm a")}`,
    }
  }

  if (commands.date.test(trimmed)) {
    return {
      success: true,
      response: `Today is ${format(new Date(), "EEEE, MMMM d, yyyy")}`,
    }
  }

  if (commands.joke.test(trimmed)) {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
    return {
      success: true,
      response: randomJoke,
    }
  }

  if (commands.fact.test(trimmed)) {
    const randomFact = facts[Math.floor(Math.random() * facts.length)]
    return {
      success: true,
      response: randomFact,
    }
  }

  if (commands.readTodos.test(trimmed)) {
    const todos = ctx.getTodos?.() || []
    if (todos.length === 0) {
      return {
        success: true,
        response: "You have no todos in your list.",
      }
    }
    const incompleteTodos = todos.filter(t => !t.completed)
    if (incompleteTodos.length === 0) {
      return {
        success: true,
        response: "All your todos are complete! Great job!",
      }
    }
    const todoList = incompleteTodos.map(t => t.title).join(", ")
    return {
      success: true,
      response: `You have ${incompleteTodos.length} todos: ${todoList}`,
    }
  }

  if (commands.clearTodos.test(trimmed)) {
    ctx.clearTodos?.()
    return {
      success: true,
      response: "All todos have been cleared.",
    }
  }

  if (commands.help.test(trimmed)) {
    return {
      success: true,
      response: "I can help you with: time, date, weather, jokes, facts, adding todos, reading todos, clearing todos, setting reminders, searching, opening websites like Google, YouTube, WhatsApp Web, and ChatGPT. Just ask me naturally!",
    }
  }

  const summarizeMatch = trimmed.match(commands.summarize)
  if (summarizeMatch) {
    const topic = summarizeMatch[2]
    return {
      success: true,
      response: `I would summarize ${topic}, but I need to be connected to a knowledge API for detailed summaries.`,
      action: "summarize",
    }
  }

  const todoMatch = trimmed.match(commands.addTodo)
  if (todoMatch) {
    const task = todoMatch[3]
    ctx.addTodo?.(task)
    return {
      success: true,
      response: `Added "${task}" to your to-do list.`,
      action: "addTodo",
    }
  }

  const reminderMatch = trimmed.match(commands.reminder)
  if (reminderMatch) {
    const task = reminderMatch[2]
    const time = reminderMatch[4]
    ctx.setReminder?.(task, time)
    return {
      success: true,
      response: `Set a reminder for "${task}" ${reminderMatch[3]} ${time}.`,
      action: "setReminder",
    }
  }

  const musicMatch = trimmed.match(commands.playMusic)
  if (musicMatch) {
    const songName = musicMatch[3]
    return {
      success: true,
      response: `I would play ${songName}, but music playback requires integration with a music service.`,
      action: "playMusic",
    }
  }

  const searchMatch = trimmed.match(commands.search)
  if (searchMatch) {
    const query = searchMatch[2]
    await ctx.searchFor?.(query)
    return {
      success: true,
      response: `Searching for ${query}...`,
      action: "search",
    }
  }

  if (commands.weather.test(trimmed)) {
    const weather = await ctx.getCurrentWeather?.()
    return {
      success: true,
      response: weather || "Weather information unavailable",
      action: "weather",
    }
  }

  if (commands.notifications.test(trimmed)) {
    const notifications = await ctx.getNotifications?.()
    if (!notifications || notifications.length === 0) {
      return {
        success: true,
        response: "You have no new notifications.",
      }
    }
    return {
      success: true,
      response: `You have ${notifications.length} notifications.`,
    }
  }

  const voiceMatch = trimmed.match(commands.changeVoice)
  if (voiceMatch) {
    const voiceName = voiceMatch[2]
    return {
      success: true,
      response: `Voice changing to ${voiceName} is not yet implemented.`,
      action: "changeVoice",
    }
  }

  if (commands.repeat.test(trimmed)) {
    if (ctx.lastResponse) {
      return {
        success: true,
        response: ctx.lastResponse,
        action: "repeat",
      }
    }
    return {
      success: false,
      response: "Nothing to repeat.",
    }
  }

  if (commands.shutdown.test(trimmed)) {
    return {
      success: true,
      response: "Voice assistant stopped.",
      action: "shutdown",
    }
  }

  if (commands.openGoogle.test(trimmed)) {
    if (typeof window !== "undefined") {
      window.open("https://www.google.com", "_blank")
    }
    return {
      success: true,
      response: "Opening Google in a new tab.",
      action: "openGoogle",
    }
  }

  if (commands.openYouTube.test(trimmed)) {
    if (typeof window !== "undefined") {
      window.open("https://www.youtube.com", "_blank")
    }
    return {
      success: true,
      response: "Opening YouTube in a new tab.",
      action: "openYouTube",
    }
  }

  if (commands.openWhatsApp.test(trimmed)) {
    if (typeof window !== "undefined") {
      window.open("https://web.whatsapp.com", "_blank")
    }
    return {
      success: true,
      response: "Opening WhatsApp Web in a new tab.",
      action: "openWhatsApp",
    }
  }

  if (commands.openChatGPT.test(trimmed)) {
    if (typeof window !== "undefined") {
      window.open("https://chat.openai.com", "_blank")
    }
    return {
      success: true,
      response: "Opening ChatGPT in a new tab.",
      action: "openChatGPT",
    }
  }

  const searchGoogleMatch = trimmed.match(commands.searchGoogle)
  if (searchGoogleMatch) {
    const query = searchGoogleMatch[2]
    if (typeof window !== "undefined") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank")
    }
    return {
      success: true,
      response: `Searching Google for "${query}".`,
      action: "searchGoogle",
    }
  }

  if (commands.playASong.test(trimmed)) {
    if (typeof window !== "undefined") {
      window.open("https://music.youtube.com/search", "_blank")
    }
    return {
      success: true,
      response: "Opening YouTube Music so you can choose a song.",
      action: "playASong",
    }
  }

  return {
    success: false,
    response: "I'm sorry, I didn't understand that command. Try saying 'help' to see what I can do.",
  }
}
