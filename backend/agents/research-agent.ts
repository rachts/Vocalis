import { AgentTask, AgentResult } from './types';
import { SharedAgentContext } from './shared-context';
import { toolRouter } from '../core/toolRouter';
import { Logger } from '../utils/logger';

/**
 * ResearchAgent — Specializes in gathering information from the web.
 * Uses the browser tool to navigate, extract, and summarize content.
 * Returns a structured ResearchResult — never a raw string.
 */
export class ResearchAgent {
  static async run(task: AgentTask, context: SharedAgentContext): Promise<AgentResult> {
    const { toolName, args } = task.payload;
    Logger.info(`[ResearchAgent] Executing research task: ${task.goal}`);

    context.emitStreamEvent('agent_step', { role: 'research', action: task.goal });

    try {
      const result = await toolRouter.execute(toolName || 'browser', args || {});

      // Structure the raw tool result into a richer research artifact
      const researchResult = {
        type: 'research_result',
        query: task.goal,
        source: args?.url || 'unknown',
        rawData: result,
        summary: result?.content
          ? `Research completed. Extracted ${result.content.length} characters from source.`
          : 'Research completed (no text content extracted).',
        timestamp: new Date().toISOString(),
      };

      Logger.info(`[ResearchAgent] Research complete for: ${task.goal}`);
      return { success: true, data: researchResult };
    } catch (err: any) {
      Logger.error(`[ResearchAgent] Failed`, err);
      return { success: false, data: null, error: err.message };
    }
  }
}
