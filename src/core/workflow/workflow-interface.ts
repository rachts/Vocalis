import type { ID } from '../../types/common';
import type { Workflow, WorkflowStatus, WorkflowContext } from './workflow-types';

/**
 * IWorkflowEngine: Central execution motor for deterministic and adaptive multi-agent pipelines.
 */
export interface IWorkflowEngine {
  registerWorkflow(workflow: Workflow): void;
  getWorkflow(workflowId: ID): Workflow | undefined;
  listWorkflows(): Workflow[];
  
  executeWorkflow(
    workflowId: ID,
    initialVariables?: Record<string, unknown>,
    sessionId?: ID
  ): Promise<{ workflowId: ID; status: WorkflowStatus; finalVariables: Record<string, unknown> }>;

  pauseWorkflow(workflowId: ID): Promise<boolean>;
  resumeWorkflow(workflowId: ID): Promise<boolean>;
  cancelWorkflow(workflowId: ID): Promise<boolean>;
  
  getExecutionContext(workflowId: ID, sessionId: ID): WorkflowContext | undefined;
}
