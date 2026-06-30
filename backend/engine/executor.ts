import { AssistantContext } from './context';
import { Task } from './task';
import { Logger } from '../utils/logger';
import { toolRouter } from '../core/toolRouter';
import { eventBus, SystemEvents } from '../events/bus';

export class ExecutionEngine {
  
  static async execute(task: Task, context: AssistantContext, emitStreamEvent: (event: string, payload: any) => void): Promise<Record<string, any>> {
    task.status = 'RUNNING';
    task.timestamps.started = Date.now();
    eventBus.emit('WorkflowStarted', { taskId: task.id, goal: task.goal });
    
    if (!task.plan || task.plan.steps.length === 0) {
      Logger.info(`Executor: Task [${task.id}] has no plan steps. Completing immediately.`);
      task.status = 'COMPLETED';
      task.timestamps.completed = Date.now();
      return task.outputs;
    }

    // Sequentially execute steps for Phase 3 (parallel execution can be added later)
    for (const step of task.plan.steps) {
      Logger.info(`Executor: Running step [${step.id}] - ${step.toolName}`);
      eventBus.emit('WorkflowStepStarted', { taskId: task.id, stepId: step.id });
      emitStreamEvent('tool_start', { toolName: step.toolName, args: step.args, description: step.description, id: step.id });

      // 1. Resolve arguments (in a real system, we'd substitute variables here from previous outputs)
      const resolvedArgs = step.args;

      let attempt = 0;
      let success = false;
      const MAX_RETRIES = 1; // 1 retry on transient failures

      while (attempt <= MAX_RETRIES && !success) {
        try {
          // 2. Execute tool
          const result = await toolRouter.execute(step.toolName, resolvedArgs);
          
          // 3. Save output
          task.outputs[step.id] = result;
          success = true;
          eventBus.emit('WorkflowStepCompleted', { taskId: task.id, stepId: step.id, result });
          emitStreamEvent('tool_end', { toolName: step.toolName, result, id: step.id });
          
        } catch (error: any) {
          attempt++;
          Logger.error(`Executor: Step [${step.id}] failed on attempt ${attempt}`, error);
          if (attempt > MAX_RETRIES) {
             task.outputs[step.id] = { error: error.message };
             eventBus.emit('WorkflowStepFailed', { taskId: task.id, stepId: step.id, error: error.message });
             emitStreamEvent('tool_end', { toolName: step.toolName, error: error.message, id: step.id });
             // Depending on policy, we might halt execution or continue.
             // For now, we continue and let the final LLM response synthesize the failure.
          }
        }
      }
    }

    task.status = 'COMPLETED';
    task.timestamps.completed = Date.now();
    eventBus.emit('WorkflowCompleted', { taskId: task.id });
    
    return task.outputs;
  }
}
