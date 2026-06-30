import { EventEmitter } from 'events';
import { Agent, AgentRole, AgentStatus, AgentTask, AgentResult, createAgent, HistoryEntry } from './types';
import { SharedAgentContext } from './shared-context';
import { eventBus, SystemEvents } from '../events/bus';
import { Logger } from '../utils/logger';
import { persistence } from './persistence';

// ─── Import all specialist agents ────────────────────────────────────────────
import { PlannerAgent } from './planner-agent';
import { ResearchAgent } from './research-agent';
import { AutomationAgent } from './automation-agent';
import { MemoryAgent } from './memory-agent';
import { ConversationAgent } from './conversation-agent';

/**
 * AgentRuntime — The central orchestration hub for all agents.
 * Responsible for spawning, monitoring, dispatching, and cancelling agents.
 */
export class AgentRuntime extends EventEmitter {
  private agents: Map<string, Agent> = new Map();

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Creates a new agent instance and registers it.
   */
  createAgent(role: AgentRole, goal: string): Agent {
    const agent = createAgent(role, goal);
    this.agents.set(agent.id, agent);
    
    Logger.info(`[Runtime] Agent created: ${agent.id} (${role}) — "${goal.substring(0, 60)}..."`);
    eventBus.emit(SystemEvents.AgentCreated, { agentId: agent.id, role, goal });
    persistence.save(this);
    
    return agent;
  }

  /**
   * Dispatches a task to an agent and runs it asynchronously.
   * Returns the agent ID immediately — don't await the full execution.
   */
  async dispatch(role: AgentRole, task: AgentTask, context: SharedAgentContext): Promise<string> {
    const agent = this.createAgent(role, task.goal);
    agent.assignedTask = task;
    
    // Fire and forget — don't block the caller
    this._runAgent(agent, context).catch(err => {
      Logger.error(`[Runtime] Unhandled error in agent ${agent.id}`, err);
    });

    return agent.id;
  }

  /**
   * Synchronously runs an agent inline (blocking until it completes).
   * Used by PlannerAgent when it needs sub-agent results before continuing.
   */
  async dispatchSync(role: AgentRole, task: AgentTask, context: SharedAgentContext): Promise<AgentResult> {
    const agent = this.createAgent(role, task.goal);
    agent.assignedTask = task;
    await this._runAgent(agent, context);
    return agent.result ?? { success: false, data: null, error: 'Agent produced no result' };
  }

  /**
   * Cancels a running agent.
   */
  cancel(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status === 'COMPLETED' || agent.status === 'FAILED') return false;

    this._setStatus(agent, 'CANCELLED');
    Logger.info(`[Runtime] Agent cancelled: ${agentId}`);
    persistence.save(this);
    return true;
  }

  // ─── Internal Execution ─────────────────────────────────────────────────────

  private async _runAgent(agent: Agent, context: SharedAgentContext): Promise<void> {
    this._setStatus(agent, 'RUNNING');
    agent.startedAt = Date.now();
    const start = Date.now();

    eventBus.emit(SystemEvents.AgentStarted, { agentId: agent.id, role: agent.role });
    context.emitStreamEvent('agent_started', { agentId: agent.id, role: agent.role, goal: agent.goal });

    try {
      const result = await this._routeToSpecialist(agent, context);
      
      agent.result = { ...result, durationMs: Date.now() - start };
      this._setStatus(agent, 'COMPLETED');
      agent.completedAt = Date.now();

      this._addHistory(agent, 'completed', result.data);
      eventBus.emit(SystemEvents.AgentCompleted, { agentId: agent.id, role: agent.role, result: agent.result });
      context.emitStreamEvent('agent_completed', { agentId: agent.id, role: agent.role, result: agent.result });

    } catch (err: any) {
      agent.result = { success: false, data: null, error: err.message, durationMs: Date.now() - start };
      this._setStatus(agent, 'FAILED');
      agent.completedAt = Date.now();

      this._addHistory(agent, 'failed', err.message);
      eventBus.emit(SystemEvents.AgentFailed, { agentId: agent.id, role: agent.role, error: err.message });
      context.emitStreamEvent('agent_failed', { agentId: agent.id, role: agent.role, error: err.message });

      Logger.error(`[Runtime] Agent ${agent.id} (${agent.role}) failed`, err);
    }

    persistence.save(this);
  }

  private async _routeToSpecialist(agent: Agent, context: SharedAgentContext): Promise<AgentResult> {
    const task = agent.assignedTask!;
    
    switch (agent.role) {
      case 'planner':      return PlannerAgent.run(task, context, this);
      case 'research':     return ResearchAgent.run(task, context);
      case 'automation':   return AutomationAgent.run(task, context);
      case 'memory':       return MemoryAgent.run(task, context);
      case 'conversation': return ConversationAgent.run(task, context);
      default:
        throw new Error(`No specialist registered for role: ${agent.role}`);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private _setStatus(agent: Agent, status: AgentStatus) {
    agent.status = status;
    this._addHistory(agent, `status:${status}`);
  }

  private _addHistory(agent: Agent, event: string, detail?: any) {
    const entry: HistoryEntry = { timestamp: Date.now(), event, detail };
    agent.executionHistory.push(entry);
  }

  // ─── Querying ───────────────────────────────────────────────────────────────

  getAll(): Agent[] {
    return Array.from(this.agents.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getByStatus(status: AgentStatus): Agent[] {
    return this.getAll().filter(a => a.status === status);
  }

  /**
   * Restore serialized agents into memory (called on startup by persistence layer).
   */
  restore(agents: Agent[]) {
    for (const agent of agents) {
      this.agents.set(agent.id, agent);
    }
    Logger.info(`[Runtime] Restored ${agents.length} agents from persistence.`);
    eventBus.emit(SystemEvents.WorkflowRecovered, { count: agents.length });
  }
}

export const agentRuntime = new AgentRuntime();
