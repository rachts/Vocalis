import { ITool } from '../base';
import { SchemaType } from '@google/generative-ai';
import { exec } from 'child_process';
import { promisify } from 'util';
import { jobQueue } from '../../jobs/queue';
import { Logger } from '../../utils/logger';

const execAsync = promisify(exec);

export const TerminalTool: ITool = {
  name: 'terminal',
  description: 'Execute a shell command. Use the "background" flag for long-running processes (e.g. servers). Always requires permission.',
  requiresPermission: true,
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      command: {
        type: SchemaType.STRING,
        description: 'The shell command to execute',
      },
      cwd: {
        type: SchemaType.STRING,
        description: 'Optional working directory',
      },
      background: {
        type: SchemaType.BOOLEAN,
        description: 'Set to true if this is a long-running command that should not block',
      }
    },
    required: ['command']
  },
  execute: async (args: any) => {
    const { command, cwd, background } = args;
    
    try {
      if (background) {
        // Dispatch to background queue
        const jobId = await jobQueue.dispatch(`Terminal: ${command.substring(0, 20)}...`, { command, cwd }, async () => {
          Logger.info(`Executing background command: ${command}`);
          const { stdout, stderr } = await execAsync(command, { cwd, maxBuffer: 1024 * 1024 * 5 });
          return { stdout, stderr };
        });
        
        return { success: true, message: `Command spawned in background job ${jobId}` };
      } else {
        // Execute inline
        Logger.info(`Executing inline command: ${command}`);
        const { stdout, stderr } = await execAsync(command, { cwd, timeout: 60000, maxBuffer: 1024 * 1024 * 5 });
        return { success: true, stdout, stderr };
      }
    } catch (e: any) {
      return { success: false, error: e.message, stderr: e.stderr, stdout: e.stdout };
    }
  }
};
