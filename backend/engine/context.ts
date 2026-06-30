import { ConversationSession } from '../core/conversation';

/**
 * Shared Assistant Context
 * Passed through the entire execution pipeline (Planner, Executor, Tools)
 */
export interface AssistantContext {
  session: ConversationSession;
  userId: string;
  // In the future:
  // permissions: PermissionManager;
  // memory: MemorySystem;
  // logger: Logger;
  // ...
}

export function createAssistantContext(session: ConversationSession, userId: string): AssistantContext {
  return {
    session,
    userId,
  };
}
