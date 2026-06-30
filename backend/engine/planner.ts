import { AssistantContext } from './context';
import { Task, ExecutionPlan } from './task';
import { Logger } from '../utils/logger';
import { generatePlan } from '../services/gemini';

export class Planner {
  /**
   * Generates an ExecutionPlan for a given Task by querying the LLM
   * with the available tools and conversation context.
   */
  static async createPlan(task: Task, context: AssistantContext): Promise<ExecutionPlan> {
    Logger.info(`Planner: Creating plan for task [${task.id}]`, { goal: task.goal });
    
    try {
      // 1. Gather context
      const history = context.session.getGeminiHistory();
      
      // 2. Call LLM to generate the JSON execution plan
      const plan = await Logger.trackExecutionTime('Planner_generatePlan', () => 
        generatePlan(task.goal, history)
      );
      
      task.plan = plan;
      Logger.info(`Planner: Generated plan with ${plan.steps.length} steps.`);
      return plan;
      
    } catch (error: any) {
      Logger.error(`Planner failed to create plan for task [${task.id}]`, error);
      // Fallback or error plan
      return {
        steps: [],
        requiresFinalResponse: true
      };
    }
  }
}
