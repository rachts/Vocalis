import type { Metadata, ID } from '../../types/common';
import type { ILogger } from '../logging/logger-interface';

/**
 * Fundamental contracts and schemas for the centralized Tool Registry architecture.
 * Every capability registered in Vocalis must adhere to this unified structural format.
 */

export interface ToolParameterProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  items?: ToolParameterProperty;
  properties?: Record<string, ToolParameterProperty>;
  enum?: Array<string | number>;
}

export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
}

export interface ToolExecutionContext {
  callId?: ID;
  sessionId?: ID;
  userId?: ID;
  logger?: ILogger;
  metadata?: Metadata;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  output: T;
  callId: ID;
  durationMs: number;
  error?: string;
  metadata?: Metadata;
}

/**
 * ITool: Central interface for actionable system tools and dynamic capabilities.
 */
export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly parameters: ToolParameterSchema;

  /**
   * Executes the capability with type-safe arguments and contextual tracking.
   */
  execute(args: Record<string, unknown>, context?: ToolExecutionContext): Promise<ToolResult>;
}
