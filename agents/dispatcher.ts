import { BaseAgent } from "./base";
import { ChatAgent } from "./chat";
import { ResearchAgent } from "./research";
import { DigestAgent } from "./digest";
import { ReminderAgent } from "./reminder";
import { NavigatorAgent } from "./navigator";
import { geminiFlash } from "../lib/llm";
import { Message } from "../types/agents";

export async function dispatchAgent(transcript: string, history: Message[]): Promise<BaseAgent> {
  const prompt = \`
You are an intent classifier for a voice assistant.
Given the user's transcript, return ONLY the name of the agent that should handle it.
Available agents:
- ChatAgent: general chat, time, weather.
- ResearchAgent: searching the web, getting news.
- DigestAgent: getting the morning digest or briefing.
- ReminderAgent: setting reminders, adding to-dos.
- NavigatorAgent: opening URLs, navigating to websites.

Transcript: "\${transcript}"
Agent:\`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const agentName = result.response.text().trim();
    
    switch (agentName) {
      case "ResearchAgent": return new ResearchAgent();
      case "DigestAgent": return new DigestAgent();
      case "ReminderAgent": return new ReminderAgent();
      case "NavigatorAgent": return new NavigatorAgent();
      default: return new ChatAgent();
    }
  } catch (error) {
    console.error("Dispatcher error:", error);
    return new ChatAgent();
  }
}
