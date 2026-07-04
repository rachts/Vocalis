import { SchemaType } from '@google/generative-ai';
import { ITool } from '../base';
import { memoryStore } from '../../memory';

export const memoryStoreTool: ITool = {
  name: "storeMemory",
  description: "Remember a fact or piece of information for the long term. Use this when the user asks you to remember something.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      key: {
        type: SchemaType.STRING,
        description: "A short, unique identifier or topic for the memory (e.g., 'user_name', 'favorite_color')",
      },
      value: {
        type: SchemaType.STRING,
        description: "The information to remember",
      },
      category: {
        type: SchemaType.STRING,
        description: "The memory type category (e.g., KNOWLEDGE, CODE, PEOPLE, FILE, PROJECT, CONVERSATION, PREFERENCE)",
      },
      importanceScore: {
        type: SchemaType.NUMBER,
        description: "An importance score from 0 to 100 for how critical this memory is.",
      }
    },
    required: ["key", "value"],
  },
  requiresPermission: false,
  execute: async (args: { key: string, value: string, category?: string, importanceScore?: number }) => {
    await memoryStore.store({
      id: args.key,
      content: args.value,
      category: args.category || 'KNOWLEDGE',
      importanceScore: args.importanceScore ?? 50
    });
    return `Successfully remembered: ${args.key} = ${args.value}`;
  }
};

export const memoryRetrieveTool: ITool = {
  name: "retrieveMemory",
  description: "Recall a fact or piece of information that was previously stored.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      key: {
        type: SchemaType.STRING,
        description: "The short, unique identifier or topic to look up (e.g., 'user_name')",
      },
    },
    required: ["key"],
  },
  requiresPermission: false,
  execute: async (args: { key: string }) => {
    const value = await memoryStore.retrieve(args.key);
    if (value) {
      return `Memory found: ${args.key} = ${value}`;
    }
    return `No memory found for key: ${args.key}`;
  }
};
