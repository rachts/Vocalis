import { AgentTask, AgentResult } from './types';
import { SharedAgentContext } from './shared-context';
import { toolRouter } from '../core/toolRouter';
import { Logger } from '../utils/logger';

/**
 * AutomationAgent — Handles all native OS interactions:
 * filesystem, terminal, clipboard, notifications, and scheduling.
 * Executes actions but makes NO planning decisions.
 */
export class AutomationAgent {
  static async run(task: AgentTask, context: SharedAgentContext): Promise<AgentResult> {
    const { toolName, args, stepId } = task.payload;
    Logger.info(`[AutomationAgent] Executing: ${toolName} — ${task.goal}`);

    context.emitStreamEvent('agent_step', { role: 'automation', action: task.goal, tool: toolName });

    let attempts = 0;
    const maxRetries = context.config.maxAutomationRetries;

    while (attempts <= maxRetries) {
      try {
        const result = await toolRouter.execute(toolName, args || {});

        Logger.info(`[AutomationAgent] Step "${stepId}" succeeded with tool "${toolName}".`);
        return { success: true, data: result };
      } catch (err: any) {
        attempts++;
        Logger.warn(`[AutomationAgent] Attempt ${attempts} failed for "${toolName}": ${err.message}`);
        if (attempts > maxRetries) {
          return { success: false, data: null, error: err.message };
        }
        // Brief back-off before retry
        await new Promise(r => setTimeout(r, 500 * attempts));
      }
    }

    return { success: false, data: null, error: 'Max retries exceeded' };
  }
}
