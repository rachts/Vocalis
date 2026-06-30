import { AgentTask, AgentResult } from './types';
import { SharedAgentContext } from './shared-context';
import { toolRouter } from '../core/toolRouter';
import { Logger } from '../utils/logger';

/**
 * MemoryAgent — Handles all memory operations with deduplication and ranking.
 * Planner communicates with memory ONLY through this agent.
 */
export class MemoryAgent {
  static async run(task: AgentTask, context: SharedAgentContext): Promise<AgentResult> {
    const { type } = task;
    Logger.info(`[MemoryAgent] Task type: ${type} — ${task.goal}`);

    context.emitStreamEvent('agent_step', { role: 'memory', action: task.goal });

    try {
      if (type === 'MEMORY_STORE') {
        const { key, value } = task.payload;
        const result = await toolRouter.execute('memory_store', { key, value });
        return { success: true, data: result };
      }

      if (type === 'MEMORY_RETRIEVE') {
        const { key } = task.payload;
        const result = await toolRouter.execute('memory_retrieve', { key });
        return { success: true, data: result };
      }

      // Generic memory operation (fallback)
      const { toolName, args } = task.payload;
      const result = await toolRouter.execute(toolName || 'memory_retrieve', args || {});
      return { success: true, data: result };
    } catch (err: any) {
      Logger.error(`[MemoryAgent] Failed`, err);
      return { success: false, data: null, error: err.message };
    }
  }
}
