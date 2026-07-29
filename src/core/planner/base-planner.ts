import type { IPlanner } from './planner-interface';
import type { Plan, ExecutionStep, ExecutionContext, AgentResponse } from './planner-types';
import { PlannerError } from '../errors/error-types';
import type { ILogger } from '../logging/logger-interface';
import type { IEventBus } from '../events/event-bus';
import { AIOSEventTypes } from '../events/event-types';
import { generateId } from '../../utils/id-generator';

/**
 * BasePlanner: Abstract scaffolding for future AI reasoning implementations.
 * Emits standard lifecycle telemetry, logs step transitions, and wraps planning exceptions.
 * Do not implement actual LLM reasoning here; Phase 2 engines extend this foundation.
 */
export abstract class BasePlanner implements IPlanner {
  public readonly plannerName: string;
  protected readonly logger?: ILogger;
  protected readonly eventBus?: IEventBus;

  constructor(plannerName: string, options?: { logger?: ILogger; eventBus?: IEventBus }) {
    this.plannerName = plannerName;
    this.logger = options?.logger?.withContext({ planner: plannerName });
    this.eventBus = options?.eventBus;
  }

  public async createPlan(goal: string, context: ExecutionContext): Promise<Plan> {
    const planId = generateId('plan');
    const startTime = Date.now();

    try {
      this.logger?.debug(`Synthesizing plan for goal: "${goal}"`, { planId, sessionId: context.sessionId });
      const plan = await this.doCreatePlan(goal, { ...context, logger: this.logger, eventBus: this.eventBus });
      const durationMs = Date.now() - startTime;

      this.logger?.info(`Plan ${plan.id} created successfully with ${plan.steps.length} steps in ${durationMs}ms`);
      
      const activeEventBus = context.eventBus || this.eventBus;
      activeEventBus?.emit(AIOSEventTypes.PLANNER_STARTED, {
        planId: plan.id,
        goal: plan.goal,
        sessionId: context.sessionId,
        stepCount: plan.steps.length,
      }, 'BasePlanner');

      return plan;
    } catch (error) {
      const plannerError = new PlannerError(`Failed to create plan for goal: "${goal}"`, 'PLANNER_CREATE_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        details: { goal, sessionId: context.sessionId },
      });
      this.logger?.error(`Plan synthesis failed`, undefined, plannerError);
      
      const activeEventBus = context.eventBus || this.eventBus;
      activeEventBus?.emit(AIOSEventTypes.PLANNER_FAILED, {
        goal,
        error: plannerError.message,
        sessionId: context.sessionId,
      }, 'BasePlanner');

      throw plannerError;
    }
  }

  public async executeStep(step: ExecutionStep, context: ExecutionContext): Promise<AgentResponse> {
    const startTime = Date.now();
    try {
      this.logger?.debug(`Executing plan step #${step.stepNumber} [${step.id}]`, { description: step.description });
      const response = await this.doExecuteStep(step, context);
      const durationMs = Date.now() - startTime;

      this.logger?.info(`Step #${step.stepNumber} finished with status success=${response.success} in ${durationMs}ms`);

      const activeEventBus = context.eventBus || this.eventBus;
      activeEventBus?.emit(AIOSEventTypes.PLANNER_STEP_EXECUTED, {
        stepId: step.id,
        stepNumber: step.stepNumber,
        success: response.success,
        durationMs,
      }, 'BasePlanner');

      return response;
    } catch (error) {
      const plannerError = new PlannerError(`Execution failed on step #${step.stepNumber}: ${step.description}`, 'PLANNER_STEP_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        details: { stepId: step.id, sessionId: context.sessionId },
      });
      this.logger?.error(`Step #${step.stepNumber} execution threw error`, undefined, plannerError);
      throw plannerError;
    }
  }

  public async evaluateProgress(plan: Plan, context: ExecutionContext): Promise<{ completed: boolean; nextStep?: ExecutionStep; error?: string }> {
    try {
      const progress = await this.doEvaluateProgress(plan, context);
      if (progress.completed) {
        const activeEventBus = context.eventBus || this.eventBus;
        activeEventBus?.emit(AIOSEventTypes.PLANNER_FINISHED, {
          planId: plan.id,
          success: true,
          stepCount: plan.steps.length,
        }, 'BasePlanner');
      }
      return progress;
    } catch (error) {
      const plannerError = new PlannerError(`Failed evaluating progress for plan ${plan.id}`, 'PLANNER_EVAL_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
      });
      this.logger?.error(`Progress evaluation failed`, undefined, plannerError);
      throw plannerError;
    }
  }

  protected abstract doCreatePlan(goal: string, context: ExecutionContext): Promise<Plan>;
  protected abstract doExecuteStep(step: ExecutionStep, context: ExecutionContext): Promise<AgentResponse>;
  protected abstract doEvaluateProgress(plan: Plan, context: ExecutionContext): Promise<{ completed: boolean; nextStep?: ExecutionStep; error?: string }>;
}
