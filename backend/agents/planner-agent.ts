import { AgentTask, AgentResult, createAgentTask } from './types';
import { SharedAgentContext } from './shared-context';
import { Logger } from '../utils/logger';
import { generatePlan } from '../services/gemini';
import { eventBus, SystemEvents } from '../events/bus';

// Type-only import to avoid circular dependency
import type { AgentRuntime } from './runtime';

/**
 * PlannerAgent — Decomposes a user goal into structured subtasks and delegates
 * them to specialist agents. Never executes tools directly.
 */
export class PlannerAgent {
  static async run(
    task: AgentTask,
    context: SharedAgentContext,
    runtime: AgentRuntime
  ): Promise<AgentResult> {
    const { goal } = task;
    Logger.info(`[PlannerAgent] Planning goal: "${goal.substring(0, 80)}"`);

    context.emitStreamEvent('stage_change', { stage: 'planning' });

    try {
      // 1. Generate a high-level execution plan using the LLM
      const history = context.session.getGeminiHistory();
      const plan = await generatePlan(goal, history);
      
      context.emitStreamEvent('plan_created', { plan });
      Logger.info(`[PlannerAgent] Plan created with ${plan.steps.length} steps.`);

      context.emitStreamEvent('stage_change', { stage: 'executing' });

      const results: Record<string, any> = {};

      // 2. For each step, determine which specialist agent handles it
      for (const step of plan.steps) {
        const role = PlannerAgent._mapToolToRole(step.toolName);
        
        const subTask = createAgentTask(
          PlannerAgent._mapRoleToTaskType(role),
          step.description,
          { toolName: step.toolName, args: step.args, stepId: step.id },
          task.id
        );

        eventBus.emit(SystemEvents.TaskDelegated, {
          from: 'planner',
          to: role,
          taskId: subTask.id,
          goal: subTask.goal,
        });

        Logger.info(`[PlannerAgent] Delegating step "${step.id}" to ${role} agent.`);
        context.emitStreamEvent('agent_delegating', { role, step: step.description });

        // Execute synchronously (planner waits for each step result)
        const subResult = await runtime.dispatchSync(role, subTask, context);
        results[step.id] = subResult.data;

        if (!subResult.success) {
          Logger.warn(`[PlannerAgent] Step "${step.id}" failed: ${subResult.error}`);
        }
      }

      // 3. Store results in shared working memory for the ConversationAgent
      context.workingMemory['toolOutputs'] = results;
      context.workingMemory['plan'] = plan;

      // 4. Delegate final response synthesis to the ConversationAgent
      if (plan.requiresFinalResponse) {
        const convTask = createAgentTask(
          'CONVERSATION',
          `Synthesize a final response for: ${goal}`,
          { goal, toolOutputs: results },
          task.id
        );

        await runtime.dispatchSync('conversation', convTask, context);
      }

      return { success: true, data: results };
    } catch (err: any) {
      Logger.error('[PlannerAgent] Planning failed', err);
      return { success: false, data: null, error: err.message };
    }
  }

  /**
   * Maps a tool name to the agent role best suited to execute it.
   */
  private static _mapToolToRole(toolName: string): 'research' | 'automation' | 'memory' | 'conversation' {
    const researchTools = ['browser'];
    const automationTools = ['filesystem', 'terminal', 'clipboard', 'notification'];
    const memoryTools = ['memory_store', 'memory_retrieve'];

    if (researchTools.includes(toolName)) return 'research';
    if (automationTools.includes(toolName)) return 'automation';
    if (memoryTools.includes(toolName)) return 'memory';
    return 'automation'; // default fallback
  }

  private static _mapRoleToTaskType(role: string): AgentTask['type'] {
    const map: Record<string, AgentTask['type']> = {
      research: 'RESEARCH',
      automation: 'AUTOMATION',
      memory: 'MEMORY_STORE',
      conversation: 'CONVERSATION',
    };
    return map[role] || 'AUTOMATION';
  }
}
