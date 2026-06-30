import { randomUUID } from 'crypto';

// ─── Agent Roles ────────────────────────────────────────────────────────────
export type AgentRole =
  | 'planner'
  | 'research'
  | 'automation'
  | 'memory'
  | 'conversation';

// ─── Agent Status ────────────────────────────────────────────────────────────
export type AgentStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

// ─── Task Types — Structured contract between agents (never raw prompts) ─────
export type AgentTaskType =
  | 'PLAN'
  | 'RESEARCH'
  | 'AUTOMATION'
  | 'MEMORY_STORE'
  | 'MEMORY_RETRIEVE'
  | 'CONVERSATION';

export interface AgentTask {
  id: string;
  type: AgentTaskType;
  goal: string;
  payload: Record<string, any>;
  originAgentId?: string; // which agent delegated this task
  createdAt: number;
}

export function createAgentTask(
  type: AgentTaskType,
  goal: string,
  payload: Record<string, any> = {},
  originAgentId?: string
): AgentTask {
  return {
    id: randomUUID(),
    type,
    goal,
    payload,
    originAgentId,
    createdAt: Date.now(),
  };
}

// ─── Agent Result ─────────────────────────────────────────────────────────────
export interface AgentResult {
  success: boolean;
  data: any;
  error?: string;
  durationMs?: number;
}

// ─── History Entry ────────────────────────────────────────────────────────────
export interface HistoryEntry {
  timestamp: number;
  event: string;
  detail?: any;
}

// ─── Full Agent Model ─────────────────────────────────────────────────────────
export interface Agent {
  id: string;
  role: AgentRole;
  goal: string;
  status: AgentStatus;
  assignedTask: AgentTask | null;
  executionHistory: HistoryEntry[];
  memoryContext: Record<string, any>;
  result?: AgentResult;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export function createAgent(role: AgentRole, goal: string): Agent {
  return {
    id: randomUUID(),
    role,
    goal,
    status: 'IDLE',
    assignedTask: null,
    executionHistory: [],
    memoryContext: {},
    createdAt: Date.now(),
  };
}
