import type { Metadata } from '../types/common';
import type { ToolCall } from '../core/planner/planner-types';

/**
 * Fundamental domain types and configurations for Autonomous Agents in Vocalis OS.
 */

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  modelProvider?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  metadata?: Metadata;
}

export interface AgentExecutionResult<T = unknown> {
  success: boolean;
  output: string;
  toolCalls?: Array<{ toolName: string; arguments: Record<string, unknown>; result?: unknown }>;
  data?: T;
  durationMs: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: string;
  metadata?: Metadata;
}
