import { randomUUID } from 'crypto';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface WorkflowStep {
  id: string;
  toolName: string;
  args: Record<string, any>;
  description: string;
  dependencies?: string[]; // IDs of previous steps this depends on
}

export interface ExecutionPlan {
  steps: WorkflowStep[];
  requiresFinalResponse: boolean;
}

export class Task {
  public id: string;
  public goal: string;
  public status: TaskStatus = 'PENDING';
  public plan: ExecutionPlan | null = null;
  public outputs: Record<string, any> = {};
  public timestamps: {
    created: number;
    started?: number;
    completed?: number;
  };
  public retryCount: number = 0;

  constructor(goal: string) {
    this.id = randomUUID();
    this.goal = goal;
    this.timestamps = { created: Date.now() };
  }
}
