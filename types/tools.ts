export type ToolName =
  | "get_time_date"
  | "get_weather"
  | "web_search"
  | "open_url"
  | "add_todo"
  | "list_todos"
  | "complete_todo"
  | "get_news"
  | "set_reminder"
  | "play_music"
  | "run_morning_digest";

export interface ToolCall {
  name: ToolName;
  args: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  data: unknown;
  spokenSummary: string; // what the TTS should say
}
