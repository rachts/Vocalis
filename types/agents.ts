import { ToolName } from "./tools";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentResponse {
  response: string;
  toolCalls?: { name: ToolName; args: Record<string, unknown> }[];
  action?: string;
}
