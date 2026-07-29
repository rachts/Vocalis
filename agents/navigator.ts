import { BaseAgent } from "./base";
import { Message, AgentResponse } from "../types/agents";
import { ToolName } from "../types/tools";
import { geminiFlash } from "../lib/llm";
import { TOOL_DEFINITIONS, executeTool } from "../lib/tools";

export class NavigatorAgent extends BaseAgent {
  name = "NavigatorAgent";
  systemPrompt = "You help the user navigate the web and open URLs.";
  tools: ToolName[] = ["open_url"];

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
