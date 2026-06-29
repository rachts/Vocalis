import { randomUUID } from 'crypto';
import { Logger } from '../utils/logger';
import { eventBus, SystemEvents } from '../events/bus';

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export class ConversationSession {
  public id: string;
  public currentTopic: string = 'general';
  public history: Message[] = [];
  public temporaryMemory: Record<string, any> = {};
  public lastIntent?: string;

  constructor(id?: string) {
    this.id = id || randomUUID();
    Logger.info(`Conversation started: ${this.id}`);
    eventBus.emit(SystemEvents.ConversationStarted, { id: this.id });
  }

  addMessage(role: 'user' | 'model', content: string) {
    this.history.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
  }

  getGeminiHistory() {
    return this.history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
  }

  endSession() {
    Logger.info(`Conversation ended: ${this.id}`);
    eventBus.emit(SystemEvents.ConversationEnded, { id: this.id });
  }
}

// In-memory store of active sessions (keyed by user/socket ID)
export const activeSessions: Map<string, ConversationSession> = new Map();

export function getOrCreateSession(sessionId: string): ConversationSession {
  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, new ConversationSession(sessionId));
  }
  return activeSessions.get(sessionId)!;
}
