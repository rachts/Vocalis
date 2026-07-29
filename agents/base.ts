import { Message, AgentResponse } from "../types/agents";
import { ToolName } from "../types/tools";

export abstract class BaseAgent {
  abstract name: string;
  abstract systemPrompt: string;
  abstract tools: ToolName[];
  
  abstract run(input: string, history: Message[]): Promise<AgentResponse>;
}
