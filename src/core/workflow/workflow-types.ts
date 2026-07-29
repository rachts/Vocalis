import type { ID, Timestamp, Metadata } from '../../types/common';

/**
 * Domain structures for programmatic multi-step Workflow orchestration and adaptive execution routing.
 */

export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type RoutingStrategy = 'sequential' | 'parallel' | 'conditional' | 'adaptive-agent';

export interface WorkflowStep {
  id: ID;
  stepName: string;
  agentName?: string;
  action?: string;
  input?: Record<string, unknown>;
  dependencies?: ID[];
  condition?: string;
  metadata?: Metadata;
}

export interface Workflow {
  id: ID;
  name: string;
  description: string;
  strategy: RoutingStrategy;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdAt: Timestamp;
  metadata?: Metadata;
}

export interface WorkflowExecutionHistory {
  stepId: ID;
  result: unknown;
  error?: string;
  durationMs: number;
  timestamp: Timestamp;
}

export interface WorkflowContext {
  workflowId: ID;
  sessionId: ID;
  variables: Record<string, unknown>;
  currentStepId?: ID;
  history: WorkflowExecutionHistory[];
  metadata?: Metadata;
}
