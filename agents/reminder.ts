import { BaseAgent } from "./base";
import { Message, AgentResponse } from "../types/agents";
import { ToolName } from "../types/tools";
import { geminiFlash } from "../lib/llm";
import { TOOL_DEFINITIONS, executeTool } from "../lib/tools";

export class ReminderAgent extends BaseAgent {
  name = "ReminderAgent";
  systemPrompt = "You manage the user's reminders and todos. You can add items and list them.";
  tools: ToolName[] = ["set_reminder", "add_todo", "list_todos", "complete_todo"];

  async run(input: string, history: Message[]): Promise<AgentResponse> {
    const activeTools = TOOL_DEFINITIONS.filter(t => this.tools.includes(t.name as ToolName));
    
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
      const call = functionCalls[0];
      const toolResult = await executeTool({ name: call.name as ToolName, args: call.args });
      return { response: toolResult.spokenSummary };
    }

    return { response: response.text().trim() };
  }
}
