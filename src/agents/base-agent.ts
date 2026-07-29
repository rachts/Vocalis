import type { IAgent, ISpecialistAgent, IExecutiveAgent } from './agent-interface';
import type { AgentConfig, AgentExecutionResult } from './agent-types';
import { AIOSError } from '../core/errors/error-types';
import type { ILogger } from '../core/logging/logger-interface';
import type { IEventBus } from '../core/events/event-bus';
import { AIOSEventTypes } from '../core/events/event-types';

/**
 * BaseAgent: Foundation abstraction managing agent lifecycle, telemetry, and error resilience.
 */
export abstract class BaseAgent implements IAgent {
  public readonly name: string;
  public readonly role: string;
  public readonly config: AgentConfig;
  protected readonly logger?: ILogger;
  protected readonly eventBus?: IEventBus;
  protected isInitialized = false;

  constructor(config: AgentConfig, options?: { logger?: ILogger; eventBus?: IEventBus }) {
    this.name = config.name;
    this.role = config.role;
    this.config = config;
    this.logger = options?.logger?.withContext({ agent: this.name, role: this.role });
    this.eventBus = options?.eventBus;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.logger?.info(`Initializing agent '${this.name}' (${this.role})`);
    await this.doInitialize();
    this.isInitialized = true;
  }

  public async execute(task: string, context?: Record<string, unknown>): Promise<AgentExecutionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    const startTime = Date.now();
    this.logger?.debug(`Agent '${this.name}' executing task: "${task}"`, { context });
    this.eventBus?.emit(AIOSEventTypes.AGENT_STARTED, { agent: this.name, task }, `Agent:${this.name}`);

    try {
      const result = await this.doExecute(task, context);
      const durationMs = Date.now() - startTime;

      this.logger?.info(`Agent '${this.name}' finished task in ${durationMs}ms with success=${result.success}`);
      this.eventBus?.emit(AIOSEventTypes.AGENT_FINISHED, { agent: this.name, success: result.success, durationMs }, `Agent:${this.name}`);
      return { ...result, durationMs };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger?.error(`Agent '${this.name}' failed executing task after ${durationMs}ms`, undefined, error instanceof Error ? error : undefined);
      this.eventBus?.emit(AIOSEventTypes.AGENT_FAILED, { agent: this.name, task, error: errorMsg, durationMs }, `Agent:${this.name}`);
      
      return {
        success: false,
        output: '',
        error: errorMsg,
        durationMs,
      };
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) return;
    this.logger?.info(`Shutting down agent '${this.name}'`);
    await this.doShutdown();
    this.isInitialized = false;
  }

  protected abstract doInitialize(): Promise<void>;
  protected abstract doExecute(task: string, context?: Record<string, unknown>): Promise<Omit<AgentExecutionResult, 'durationMs'>>;
  protected abstract doShutdown(): Promise<void>;
}

/**
 * BaseSpecialistAgent: Foundation class for domain-bound expert workers.
 */
export abstract class BaseSpecialistAgent extends BaseAgent implements ISpecialistAgent {
  public abstract readonly specialtyDomain: string;
  public abstract canHandle(taskDescription: string): boolean | Promise<boolean>;
}

/**
 * BaseExecutiveAgent: Foundation class for top-level problem decomp and specialist coordination.
 */
export abstract class BaseExecutiveAgent extends BaseAgent implements IExecutiveAgent {
  protected readonly specialists = new Map<string, ISpecialistAgent>();

  public registerSpecialist(specialist: ISpecialistAgent): void {
    if (this.specialists.has(specialist.name)) {
      this.logger?.warn(`Overwriting registered specialist '${specialist.name}' in executive '${this.name}'`);
    }
    this.specialists.set(specialist.name, specialist);
    this.logger?.info(`Registered specialist '${specialist.name}' (${specialist.specialtyDomain})`);
  }

  public listSpecialists(): ISpecialistAgent[] {
    return Array.from(this.specialists.values());
  }

  public abstract delegateTask(task: string, context?: Record<string, unknown>): Promise<AgentExecutionResult>;
}
