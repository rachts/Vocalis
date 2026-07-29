import type { IEventBus } from '../core/events/event-bus';
import type { ILogger } from '../core/logging/logger-interface';
import type { IConfigManager } from '../config/config-manager';
import type { IToolRegistry } from '../core/tools/tool-registry';
import type { IMemoryProvider } from '../core/memory/memory-interfaces';
import type { IPlanner } from '../core/planner/planner-interface';
import type { IWorkflowEngine } from '../core/workflow/workflow-interface';
import type { AIProvider } from '../core/providers/provider-interface';
import type { IExecutiveAgent } from '../agents/agent-interface';

/**
 * Type-safe DI tokens to decouple concrete module dependencies in Vocalis AI OS.
 * Prevents global singletons and facilitates independent mocking during testing.
 */
export interface ServiceToken<T> {
  readonly key: symbol;
  readonly name: string;
  // Ghost type property for TS static inference
  readonly _phantom?: T;
}

export function createToken<T>(name: string): ServiceToken<T> {
  return {
    key: Symbol.for(`aios.service.${name}`),
    name,
  };
}

/**
 * Canonical DI Tokens for Core Vocalis OS Infrastructure.
 */
export const AIOSTokens = {
  EVENT_BUS: createToken<IEventBus>('EventBus'),
  LOGGER: createToken<ILogger>('Logger'),
  CONFIG: createToken<IConfigManager>('ConfigManager'),
  TOOL_REGISTRY: createToken<IToolRegistry>('ToolRegistry'),
  MEMORY_PROVIDER: createToken<IMemoryProvider>('MemoryProvider'),
  PLANNER: createToken<IPlanner>('Planner'),
  WORKFLOW_ENGINE: createToken<IWorkflowEngine>('WorkflowEngine'),
  AI_PROVIDER: createToken<AIProvider>('AIProvider'),
  EXECUTIVE_AGENT: createToken<IExecutiveAgent>('ExecutiveAgent'),
} as const;
