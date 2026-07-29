import { BaseAgent } from "./base";
import { Message, AgentResponse } from "../types/agents";
import { ToolName } from "../types/tools";
import { geminiFlash } from "../lib/llm";
import { TOOL_DEFINITIONS, executeTool } from "../lib/tools";

export class DigestAgent extends BaseAgent {
  name = "DigestAgent";
  systemPrompt = "You compile the morning digest. You summarize the weather, news, and todos for the day in a natural, spoken way.";
  tools: ToolName[] = ["get_weather", "get_news", "list_todos"];

  async run(input: string, history: Message[]): Promise<AgentResponse> {
    const activeTools = TOOL_DEFINITIONS.filter(t => this.tools.includes(t.name as ToolName));
    
    // For digest, we typically just run the morning digest generation logic
    const conversation = geminiFlash.startChat({
      history: history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }],
      })),
      tools: [{ functionDeclarations: activeTools }],
    });

    const result = await conversation.sendMessage(input);
    const response = result.response;
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      // In a real digest agent, it might need to call multiple tools sequentially
      // For this simplified version, we just execute the first
      const call = functionCalls[0];
      const toolResult = await executeTool({ name: call.name as ToolName, args: call.args });
      return { response: toolResult.spokenSummary };
    }

    return { response: response.text().trim() };
  }
}
