import { ConversationSession } from '../core/conversation';
import { permissionManager, PermissionManager } from '../permissions/manager';

/**
 * SharedAgentContext — Unified context passed to every agent.
 * Supersedes the old AssistantContext from engine/context.ts.
 */
export interface SharedAgentContext {
  // Conversation
  session: ConversationSession;
  userId: string;

  // Streaming back to the frontend SSE connection
  emitStreamEvent: (event: string, payload: any) => void;

  // Permission gate
  permissions: PermissionManager;

  // Shared working memory for this workflow run
  // (agents can read/write shared intermediate results here)
  workingMemory: Record<string, any>;

  // Configuration / feature flags
  config: {
    maxResearchDepth: number;      // how many pages the research agent will browse
    maxAutomationRetries: number;  // how many times automation retries on failure
    streamResponses: boolean;
  };
}

export function createSharedContext(
  session: ConversationSession,
  userId: string,
  emitStreamEvent: (event: string, payload: any) => void
): SharedAgentContext {
  return {
    session,
    userId,
    emitStreamEvent,
    permissions: permissionManager,
    workingMemory: {},
    config: {
      maxResearchDepth: 3,
      maxAutomationRetries: 2,
      streamResponses: true,
    },
  };
}
