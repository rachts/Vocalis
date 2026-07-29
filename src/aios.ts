import type { IServiceContainer } from './services/container';
import { bootstrapAIOS } from './services/bootstrap';
import { AIOSTokens } from './services/tokens';
import type { DeepPartial } from './types/common';
import type { AIOSConfig } from './config/schema';
import type { IConfigManager } from './config/config-manager';
import type { IEventBus } from './core/events/event-bus';
import type { ILogger } from './core/logging/logger-interface';
import type { IToolRegistry, ITool } from './core/tools';
import type { IMemoryProvider } from './core/memory';
import type { IPlanner } from './core/planner';
import type { IWorkflowEngine } from './core/workflow';
import type { IExecutiveAgent } from './agents';

/**
 * AIOS: Root architectural facade for Vocalis AI Operating System.
 * Encapsulates DI container wiring and offers an intuitive, cohesive API surface for applications.
 */
export class AIOS {
  public readonly container: IServiceContainer;

  private constructor(container: IServiceContainer) {
    this.container = container;
  }

  /**
   * Initializes the Vocalis AI OS foundation with optional runtime configuration overrides.
   */
  public static init(config?: DeepPartial<AIOSConfig>): AIOS {
    const container = bootstrapAIOS(config);
    return new AIOS(container);
  }

  /**
   * Creates an isolated child AIOS context with a child DI scope (ideal for concurrent multi-tenant voice sessions).
   */
  public createChildContext(): AIOS {
    const childContainer = this.container.createChildContainer();
    return new AIOS(childContainer);
  }

  // --- Core Infrastructure Accessors ---

  public get config(): IConfigManager {
    return this.container.resolve(AIOSTokens.CONFIG);
  }

  public get events(): IEventBus {
    return this.container.resolve(AIOSTokens.EVENT_BUS);
  }

  public get logger(): ILogger {
    return this.container.resolve(AIOSTokens.LOGGER);
  }

  public get tools(): IToolRegistry {
    return this.container.resolve(AIOSTokens.TOOL_REGISTRY);
  }

  // --- Optional / Phase 2 AI Services Accessors ---

  public get memory(): IMemoryProvider | undefined {
    return this.container.tryResolve(AIOSTokens.MEMORY_PROVIDER);
  }

  public get planner(): IPlanner | undefined {
    return this.container.tryResolve(AIOSTokens.PLANNER);
  }

  public get workflows(): IWorkflowEngine | undefined {
    return this.container.tryResolve(AIOSTokens.WORKFLOW_ENGINE);
  }

  public get executiveAgent(): IExecutiveAgent | undefined {
    return this.container.tryResolve(AIOSTokens.EXECUTIVE_AGENT);
  }

  // --- Ergonomic Convenience Helpers ---

  /**
   * Registers a custom capability or system utility into the central Tool Registry.
   */
  public registerTool(tool: ITool): void {
    this.tools.register(tool);
  }

  /**
   * Gracefully clears existing registrations or session-scoped transient buffers.
   */
  public shutdown(): void {
    this.logger.info('Shutting down Vocalis AIOS instance...');
    this.container.clear();
  }
}
