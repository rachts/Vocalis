import { ITool } from '../base';
import { SchemaType } from '@google/generative-ai';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const ClipboardTool: ITool = {
  name: 'clipboard',
  description: 'Read from or write to the system clipboard (Mac only). Action must be "read" or "write". If "write", provide text.',
  requiresPermission: false, // Reading/writing clipboard is generally okay, but we could restrict if needed.
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      action: {
        type: SchemaType.STRING,
        description: 'Action to perform: "read" or "write"',
      },
      text: {
        type: SchemaType.STRING,
        description: 'Text to write to the clipboard (required if action is "write")',
      }
    },
    required: ['action']
  },
  execute: async (args: any) => {
    try {
      if (args.action === 'read') {
        const { stdout } = await execAsync('pbpaste');
        return { success: true, text: stdout };
      } else if (args.action === 'write') {
        if (!args.text) {
          return { success: false, error: 'Text is required for write action' };
        }
        // Safely echo to pbcopy by passing through stdin instead of shell interpolation
        const child = exec('pbcopy');
        if (child.stdin) {
            child.stdin.write(args.text);
            child.stdin.end();
        }
        
        await new Promise((resolve) => child.on('close', resolve));
        return { success: true, message: 'Text copied to clipboard' };
      }
      return { success: false, error: 'Invalid action. Must be "read" or "write".' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
