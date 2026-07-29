import type { Message } from './tools';

export interface AgentResponse {
  response: string;
  action?: {
    type: 'open_url' | 'play_audio';
    payload: string;
  };
}

export interface AgentContext {
  transcript: string;
  history: Message[];
  sessionId: string;
}
