import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { ToolCall, ToolResult } from "../../types/tools";
import { weatherTool } from "./weather";
import { searchTool } from "./search";
import { navigationTool } from "./navigation";
import { datetimeTool } from "./datetime";
import { todosTool } from "./todos";
import { newsTool } from "./news";
import { reminderTool } from "./reminder";
import { digestTool } from "./digest";

export const TOOL_DEFINITIONS: FunctionDeclaration[] = [
  {
    name: "get_time_date",
    description: "Get the current time and date.",
  },
  {
    name: "get_weather",
    description: "Get the current weather for a location.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        location: {
          type: SchemaType.STRING,
          description: "The city and state, e.g. San Francisco, CA",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "web_search",
    description: "Search the web for information.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "The search query.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "open_url",
    description: "Open a URL or a website in a new tab.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        url: {
          type: SchemaType.STRING,
          description: "The URL to open, or the name of a well known website like 'youtube' or 'news'.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "add_todo",
    description: "Add a task to the todo list.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        task: {
          type: SchemaType.STRING,
          description: "The task to add.",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "get_news",
    description: "Get the latest news headlines.",
  },
  {
    name: "set_reminder",
    description: "Set a reminder for a specific task at a specific time.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        task: {
          type: SchemaType.STRING,
          description: "The task to remind the user about.",
        },
        time: {
          type: SchemaType.STRING,
          description: "The time for the reminder, formatted as an ISO date string.",
        },
      },
      required: ["task", "time"],
    },
  },
  {
    name: "run_morning_digest",
    description: "Run the morning digest.",
  }
];

export async function executeTool(call: ToolCall): Promise<ToolResult> {
  switch (call.name) {
    case "get_weather": return weatherTool(call.args);
    case "web_search": return searchTool(call.args);
    case "open_url": return navigationTool(call.args);
    case "get_time_date": return datetimeTool();
    case "add_todo": return todosTool(call.args);
    case "get_news": return newsTool();
    case "set_reminder": return reminderTool(call.args);
    case "run_morning_digest": return digestTool();
    default:
      return { success: false, data: null, spokenSummary: \`I don't know how to \${call.name}\` };
  }
}
