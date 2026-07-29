import type { Plan, ExecutionStep, ExecutionContext, AgentResponse } from './planner-types';

/**
 * IPlanner: Foundation interface for autonomous goal analysis, task decomposition, and step execution.
 */
export interface IPlanner {
  readonly plannerName: string;

  /**
   * Synthesizes an execution Plan from a user goal and session context.
   */
  createPlan(goal: string, context: ExecutionContext): Promise<Plan>;

  /**
   * Executes an individual execution step within an active plan.
   */
  executeStep(step: ExecutionStep, context: ExecutionContext): Promise<AgentResponse>;

  /**
   * Evaluates completion state of a plan and determines the subsequent logical step.
   */
  evaluateProgress(plan: Plan, context: ExecutionContext): Promise<{
    completed: boolean;
    nextStep?: ExecutionStep;
    error?: string;
  }>;
}
