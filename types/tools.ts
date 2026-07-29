export type ToolName =
  | 'get_datetime'
  | 'get_weather'
  | 'web_search'
  | 'open_url'
  | 'add_todo'
  | 'list_todos'
  | 'complete_todo'
  | 'clear_todos'
  | 'set_reminder'
  | 'run_morning_digest';

export interface ToolCall {
  name: ToolName;
  args: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  data: unknown;
  spokenSummary: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
