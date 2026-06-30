import { Router, Request, Response } from 'express';
import { agentRuntime } from '../agents/runtime';
import { createAgentTask } from '../agents/types';
import { createSharedContext } from '../agents/shared-context';
import { getOrCreateSession } from '../core/conversation';
import { Logger } from '../utils/logger';

export const agentsRouter = Router();

/**
 * GET /api/agents — Returns all agents (for the dashboard).
 */
agentsRouter.get('/agents', (req: Request, res: Response) => {
  const agents = agentRuntime.getAll();
  res.json({ agents });
});

/**
 * GET /api/agents/:id — Returns a single agent by ID.
 */
agentsRouter.get('/agents/:id', (req: Request, res: Response) => {
  const agent = agentRuntime.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent });
});

/**
 * DELETE /api/agents/:id — Cancels a running agent.
 */
agentsRouter.delete('/agents/:id', (req: Request, res: Response) => {
  const success = agentRuntime.cancel(req.params.id);
  if (!success) return res.status(404).json({ error: 'Agent not found or already completed' });
  res.json({ success: true, message: `Agent ${req.params.id} cancelled.` });
});

/**
 * POST /api/agents/goal — Creates a new long-running autonomous goal.
 * This is the main entry point for autonomous multi-agent workflows.
 */
agentsRouter.post('/agents/goal', async (req: Request, res: Response) => {
  try {
    const { goal, sessionId } = req.body;
    if (!goal) return res.status(400).json({ error: 'goal is required' });

    const session = getOrCreateSession(sessionId || 'default-session');
    session.addMessage('user', goal);

    // Create a no-op stream emitter (not connected to SSE here, but logs for observability)
    const emitStreamEvent = (event: string, payload: any) => {
      Logger.info(`[AgentGoal SSE] ${event}:`, payload);
    };

    const context = createSharedContext(session, 'default-user', emitStreamEvent);

    const task = createAgentTask('PLAN', goal, { userGoal: goal });
    const agentId = await agentRuntime.dispatch('planner', task, context);

    res.json({ success: true, agentId, message: `Goal dispatched to planner agent: ${agentId}` });
  } catch (err: any) {
    Logger.error('[AgentsAPI] Goal dispatch failed', err);
    res.status(500).json({ error: err.message });
  }
});
