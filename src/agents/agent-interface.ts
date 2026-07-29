import type { AgentConfig, AgentExecutionResult } from './agent-types';

/**
 * Hierarchy of agent interface contracts supporting individual workers and multi-agent coordination.
 */

/**
 * IAgent: Core contract for any autonomous computational entity in Vocalis.
 */
export interface IAgent {
  readonly name: string;
  readonly role: string;
  readonly config: AgentConfig;

  initialize(): Promise<void>;
  execute(task: string, context?: Record<string, unknown>): Promise<AgentExecutionResult>;
  shutdown(): Promise<void>;
}

/**
 * ISpecialistAgent: Domain-expert worker agent capable of reporting capabilities and confidence.
 */
export interface ISpecialistAgent extends IAgent {
  readonly specialtyDomain: string;
  canHandle(taskDescription: string): boolean | Promise<boolean>;
}

/**
 * IExecutiveAgent: Orchestrator agent responsible for problem decomposition and delegation to specialists.
 */
export interface IExecutiveAgent extends IAgent {
  registerSpecialist(specialist: ISpecialistAgent): void;
  delegateTask(task: string, context?: Record<string, unknown>): Promise<AgentExecutionResult>;
  listSpecialists(): ISpecialistAgent[];
}
