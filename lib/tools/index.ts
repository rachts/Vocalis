import { SchemaType } from '@google/generative-ai';
import type { ToolCall, ToolResult } from '@/types/tools';
import { datetimeTool } from './datetime';
import { weatherTool } from './weather';
import { searchTool } from './search';
import { navigationTool } from './navigation';
import { addTodoTool, listTodosTool, completeTodoTool, clearTodosTool } from './todos';

export const TOOL_DEFINITIONS = [
  {
    name: 'get_datetime',
    description: 'Get the current date and time',
    parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
  },
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { location: { type: SchemaType.STRING, description: 'City name or "current"' } },
      required: [],
    },
  },
  {
    name: 'web_search',
    description: 'Search the web for information',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { query: { type: SchemaType.STRING, description: 'Search query' } },
      required: ['query'],
    },
  },
  {
    name: 'open_url',
    description: 'Open a website. Use for: open YouTube, open Google, go to GitHub, etc.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        site: { type: SchemaType.STRING, description: 'Site name e.g. youtube, google, whatsapp' },
        url: { type: SchemaType.STRING, description: 'Full URL if site name is not known' },
      },
      required: [],
    },
  },
  {
    name: 'add_todo',
    description: 'Add a task to the todo list',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { text: { type: SchemaType.STRING, description: 'The todo item text' } },
      required: ['text'],
    },
  },
  {
    name: 'list_todos',
    description: 'List all pending todos',
    parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
  },
  {
    name: 'complete_todo',
    description: 'Mark a todo as complete',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { text: { type: SchemaType.STRING, description: 'Text or keyword of the todo to complete' } },
      required: ['text'],
    },
  },
  {
    name: 'clear_todos',
    description: 'Clear all todos',
    parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
  },
];

export async function executeTool(call: ToolCall): Promise<ToolResult> {
  switch (call.name) {
    case 'get_datetime': return datetimeTool();
    case 'get_weather': return weatherTool(call.args as { location?: string });
    case 'web_search': return searchTool(call.args as { query: string });
    case 'open_url': return navigationTool(call.args as { site?: string; url?: string });
    case 'add_todo': return addTodoTool(call.args as { text: string });
    case 'list_todos': return listTodosTool();
    case 'complete_todo': return completeTodoTool(call.args as { text: string });
    case 'clear_todos': return clearTodosTool();
    default: return { success: false, data: null, spokenSummary: "I don't know how to do that yet." };
  }
}
