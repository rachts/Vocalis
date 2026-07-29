import type { ITool, ToolParameterSchema, ToolExecutionContext, ToolResult } from './tool-interface';
import { ToolError } from '../errors/error-types';
import type { ILogger } from '../logging/logger-interface';
import type { IEventBus } from '../events/event-bus';
import { AIOSEventTypes } from '../events/event-types';
import { generateCallId } from '../../utils/id-generator';

export interface ToolSchemaEntry {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
}

/**
 * Centralized registry contract for managing capabilities across Vocalis AI OS.
 */
export interface IToolRegistry {
  register(tool: ITool): void;
  unregister(name: string): boolean;
  getTool(name: string): ITool | undefined;
  listTools(): ITool[];
  listSchemas(): ToolSchemaEntry[];
  execute(name: string, args: Record<string, unknown>, context?: ToolExecutionContext): Promise<ToolResult>;
}

/**
 * ToolRegistry: Central repository for capability discovery and automated lifecycle execution.
 * Decouples tools from agents and planners while embedding telemetry and event broadcasting.
 */
export class ToolRegistry implements IToolRegistry {
  private readonly tools = new Map<string, ITool>();
  private readonly logger?: ILogger;
  private readonly eventBus?: IEventBus;

  constructor(options?: { logger?: ILogger; eventBus?: IEventBus }) {
    this.logger = options?.logger?.withContext({ service: 'ToolRegistry' });
    this.eventBus = options?.eventBus;
  }

  public register(tool: ITool): void {
    if (this.tools.has(tool.name)) {
      this.logger?.warn(`Overwriting previously registered tool '${tool.name}'`);
    }
    this.tools.set(tool.name, tool);
    this.logger?.info(`Registered tool: '${tool.name}' (${tool.description})`);

    this.eventBus?.emit(AIOSEventTypes.TOOL_REGISTERED, {
      toolName: tool.name,
      description: tool.description,
    }, 'ToolRegistry');
  }

  public unregister(name: string): boolean {
    const existed = this.tools.delete(name);
    if (existed) {
      this.logger?.info(`Unregistered tool '${name}'`);
    }
    return existed;
  }

  public getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  public listTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  public listSchemas(): ToolSchemaEntry[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  }

  public async execute(name: string, args: Record<string, unknown>, context?: ToolExecutionContext): Promise<ToolResult> {
    const tool = this.tools.get(name);
    const startTime = Date.now();
    const callId = context?.callId || generateCallId(name);

    if (!tool) {
      const errorMsg = `Tool '${name}' is not registered in ToolRegistry.`;
      const error = new ToolError(errorMsg, 'TOOL_NOT_FOUND', { details: { tool: name } });
      this.logger?.error(errorMsg, undefined, error);
      
      this.eventBus?.emit(AIOSEventTypes.TOOL_FAILED, {
        callId,
        toolName: name,
        arguments: args,
        error: errorMsg,
        durationMs: Date.now() - startTime,
      }, 'ToolRegistry');

      throw error;
    }

    this.eventBus?.emit(AIOSEventTypes.TOOL_EXECUTED, {
      callId,
      toolName: name,
      arguments: args,
      status: 'starting',
      durationMs: 0,
    }, 'ToolRegistry');

    const result = await tool.execute(args, { ...context, callId, logger: this.logger });
    const totalDurationMs = Date.now() - startTime;

    if (result.success) {
      this.eventBus?.emit(AIOSEventTypes.TOOL_EXECUTED, {
        callId,
        toolName: name,
        arguments: args,
        result: result.output,
        durationMs: totalDurationMs,
      }, 'ToolRegistry');
    } else {
      this.eventBus?.emit(AIOSEventTypes.TOOL_FAILED, {
        callId,
        toolName: name,
        arguments: args,
        error: result.error,
        durationMs: totalDurationMs,
      }, 'ToolRegistry');
    }

    return result;
  }
}

/**
 * Factory utility for creating tool registry instances.
 */
export function createToolRegistry(options?: { logger?: ILogger; eventBus?: IEventBus }): IToolRegistry {
  return new ToolRegistry(options);
}
