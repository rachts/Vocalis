import type { ID, Timestamp, Metadata } from '../../types/common';

/**
 * Standardized Event constants and strong payload typing for internal asynchronous communication
 * across Vocalis AI Operating System modules.
 */

export const AIOSEventTypes = {
  // Voice interaction events
  VOICE_STARTED: 'VoiceStarted',
  VOICE_STOPPED: 'VoiceStopped',
  VOICE_TRANSCRIPTION_READY: 'VoiceTranscriptionReady',
  VOICE_ENDED: 'VoiceEnded',
  VOICE_ERROR: 'VoiceError',

  // Tool execution events
  TOOL_REGISTERED: 'ToolRegistered',
  TOOL_EXECUTING: 'ToolExecuting',
  TOOL_EXECUTED: 'ToolExecuted',
  TOOL_FAILED: 'ToolFailed',

  // Planner lifecycle events
  PLANNER_STARTED: 'PlannerStarted',
  PLANNER_STEP_EXECUTED: 'PlannerStepExecuted',
  PLANNER_FINISHED: 'PlannerFinished',
  PLANNER_FAILED: 'PlannerFailed',

  // Agent execution events
  AGENT_STARTED: 'AgentStarted',
  AGENT_FINISHED: 'AgentFinished',
  AGENT_FAILED: 'AgentFailed',

  // Memory operations events
  MEMORY_UPDATED: 'MemoryUpdated',
  MEMORY_QUERIED: 'MemoryQueried',

  // Provider routing & status events
  PROVIDER_CHANGED: 'ProviderChanged',
  PROVIDER_HEALTH_CHECK: 'ProviderHealthCheck',

  // System general events
  SYSTEM_INIT: 'SystemInit',
  SYSTEM_SHUTDOWN: 'SystemShutdown',
} as const;

export type AIOSEventType = (typeof AIOSEventTypes)[keyof typeof AIOSEventTypes] | string;

/**
 * Encapsulates an emitted event within the system.
 */
export interface AIOSEvent<T = unknown> {
  id: ID;
  type: AIOSEventType;
  timestamp: Timestamp;
  source?: string;
  payload: T;
  metadata?: Metadata;
}

/**
 * Type definitions for common specific event payloads to guarantee contract adherence across modules.
 */
export interface VoiceStartedPayload {
  sessionId: ID;
  audioSampleRate?: number;
  language?: string;
}

export interface VoiceEndedPayload {
  sessionId: ID;
  durationMs?: number;
  transcript?: string;
}

export interface ToolExecutedPayload {
  callId: ID;
  toolName: string;
  arguments: Record<string, unknown>;
  result: unknown;
  durationMs: number;
}

export interface PlannerStartedPayload {
  planId: ID;
  goal: string;
  sessionId: ID;
}

export interface PlannerFinishedPayload {
  planId: ID;
  success: boolean;
  stepCount: number;
  output?: string;
  error?: string;
}

export interface MemoryUpdatedPayload {
  storeType: 'session' | 'longTerm' | 'knowledge' | 'conversation';
  operation: 'insert' | 'update' | 'delete' | 'clear';
  keyOrId?: string;
  recordCount?: number;
}

export interface ProviderChangedPayload {
  previousProvider?: string;
  newProvider: string;
  reason?: 'manual_override' | 'fallback' | 'initialization';
}

/**
 * Universal event listener callback signature.
 */
export type EventListener<T = unknown> = (event: AIOSEvent<T>) => void | Promise<void>;

/**
 * Type alias for an unsubscription function returned when registering an event handler.
 */
export type Unsubscribe = () => void;
