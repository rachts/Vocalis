import { ITool } from '../base';
import { SchemaType } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';

export const FilesystemTool: ITool = {
  name: 'filesystem',
  description: 'Interact with the local filesystem. Actions: read, write, list, delete, mkdir, rename.',
  requiresPermission: true, // Will conditionally require it for destructive actions
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      action: {
        type: SchemaType.STRING,
        description: 'Action to perform: "read", "write", "list", "delete", "mkdir", or "rename"',
      },
      path: {
        type: SchemaType.STRING,
        description: 'Target file or directory path (absolute or relative to CWD)',
      },
      content: {
        type: SchemaType.STRING,
        description: 'File content (required for "write" action)',
      },
      destPath: {
        type: SchemaType.STRING,
        description: 'Destination path (required for "rename" action)',
      }
    },
    required: ['action', 'path']
  },
  execute: async (args: any) => {
    try {
      const targetPath = path.resolve(args.path);
      
      switch (args.action) {
        case 'read': {
          const content = await fs.readFile(targetPath, 'utf-8');
          return { success: true, content };
        }
        case 'write': {
          if (args.content === undefined) return { success: false, error: 'Content required for write.' };
          await fs.writeFile(targetPath, args.content, 'utf-8');
          return { success: true, message: `File written: ${targetPath}` };
        }
        case 'list': {
          const files = await fs.readdir(targetPath, { withFileTypes: true });
          const items = files.map(f => ({ name: f.name, isDirectory: f.isDirectory() }));
          return { success: true, files: items };
        }
        case 'delete': {
          const stat = await fs.stat(targetPath);
          if (stat.isDirectory()) {
            await fs.rm(targetPath, { recursive: true, force: true });
          } else {
            await fs.unlink(targetPath);
          }
          return { success: true, message: `Deleted: ${targetPath}` };
        }
        case 'mkdir': {
          await fs.mkdir(targetPath, { recursive: true });
          return { success: true, message: `Directory created: ${targetPath}` };
        }
        case 'rename': {
          if (!args.destPath) return { success: false, error: 'destPath required for rename.' };
          const dest = path.resolve(args.destPath);
          await fs.rename(targetPath, dest);
          return { success: true, message: `Renamed to: ${dest}` };
        }
        default:
          return { success: false, error: 'Invalid action.' };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
