import type { ITool, ToolParameterSchema, ToolExecutionContext, ToolResult } from './tool-interface';
import { ToolError } from '../errors/error-types';
import type { ILogger } from '../logging/logger-interface';
import { generateCallId } from '../../utils/id-generator';

/**
 * BaseTool: Abstract foundation for future capability creation.
 * Implements execution timing, diagnostic logging, parameter presence validation, and structured error catching.
 */
export abstract class BaseTool<TArgs extends Record<string, unknown> = Record<string, unknown>, TResult = unknown>
  implements ITool
{
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly parameters: ToolParameterSchema;
  protected readonly logger?: ILogger;

  constructor(options?: { logger?: ILogger }) {
    this.logger = options?.logger;
  }

  public async execute(args: Record<string, unknown>, context?: ToolExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();
    const callId = context?.callId || generateCallId(this.name || 'unknown_tool');
    const activeLogger = context?.logger || this.logger?.withContext({ tool: this.name, callId });

    try {
      activeLogger?.debug(`Executing tool '${this.name}'`, { args });
      this.validateRequiredParameters(args);

      const output = await this.doExecute(args as TArgs, context);
      const durationMs = Date.now() - startTime;

      activeLogger?.info(`Tool '${this.name}' completed successfully in ${durationMs}ms`);

      return {
        success: true,
        output,
        callId,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const toolError = new ToolError(`Tool '${this.name}' execution failed`, 'TOOL_EXECUTE_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        details: { tool: this.name, args, callId },
      });

      activeLogger?.error(`Tool '${this.name}' failed after ${durationMs}ms`, undefined, toolError);

      return {
        success: false,
        output: null,
        error: toolError.message,
        callId,
        durationMs,
      };
    }
  }

  protected validateRequiredParameters(args: Record<string, unknown>): void {
    if (!this.parameters || !this.parameters.required) {
      return;
    }
    for (const requiredKey of this.parameters.required) {
      if (!(requiredKey in args) || args[requiredKey] === undefined || args[requiredKey] === null) {
        throw new ToolError(
          `Missing required parameter '${requiredKey}' for tool '${this.name}'`,
          'TOOL_VALIDATION_ERROR'
        );
      }
    }
  }

  protected abstract doExecute(args: TArgs, context?: ToolExecutionContext): Promise<TResult>;
}
