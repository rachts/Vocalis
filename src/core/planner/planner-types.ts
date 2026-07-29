import type { ID, Timestamp, Metadata } from '../../types/common';
import type { ILogger } from '../logging/logger-interface';
import type { IEventBus } from '../events/event-bus';

/**
 * Core type interfaces for automated task planning and reasoning orchestration.
 */

export interface ToolCall {
  callId: ID;
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface AgentResponse {
  success: boolean;
  output?: string;
  toolCalls?: ToolCall[];
  data?: unknown;
  error?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Metadata;
}

export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';

export interface ExecutionStep {
  id: ID;
  stepNumber: number;
  description: string;
  toolCall?: ToolCall;
  status: StepStatus;
  result?: unknown;
  error?: string;
  dependencies?: ID[]; // Step IDs required prior to execution
  metadata?: Metadata;
}

export type PlanStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';

export interface Plan {
  id: ID;
  goal: string;
  steps: ExecutionStep[];
  status: PlanStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Metadata;
}

export interface ExecutionContext {
  sessionId: ID;
  userId?: ID;
  logger?: ILogger;
  eventBus?: IEventBus;
  metadata?: Metadata;
  maxIterations?: number;
  abortSignal?: AbortSignal;
}
