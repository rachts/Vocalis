import { ITool } from '../base';
import { SchemaType } from '@google/generative-ai';
import notifier from 'node-notifier';
import { eventBus, SystemEvents } from '../../events/bus';

export const NotificationTool: ITool = {
  name: 'notification',
  description: 'Send a desktop notification to the user.',
  requiresPermission: false,
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'Title of the notification',
      },
      message: {
        type: SchemaType.STRING,
        description: 'Message body of the notification',
      }
    },
    required: ['title', 'message']
  },
  execute: async (args: any) => {
    try {
      notifier.notify({
        title: args.title || 'Vocalis OS',
        message: args.message,
        sound: true,
      });

      // Also emit it to the frontend
      eventBus.emit(SystemEvents.NotificationTriggered, { 
        title: args.title, 
        message: args.message 
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
