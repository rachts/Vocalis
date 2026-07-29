import type { Metadata } from '../../types/common';

/**
 * Common abstractions for AI Model Providers (Gemini, OpenAI, Claude, Ollama, LM Studio).
 * Application modules must interact exclusively through AIProvider rather than specific vendor SDKs.
 */

export type ModelRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ProviderMessage {
  role: ModelRole;
  content: string | unknown[];
  name?: string;
  toolCallId?: string;
  metadata?: Metadata;
}

export interface ProviderGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[] | string;
  tools?: Array<Record<string, unknown>>;
  metadata?: Metadata;
}

export interface ProviderUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costEstimate?: number;
}

export interface ProviderResponse {
  success: boolean;
  output?: string;
  toolCalls?: Array<{
    callId: string;
    toolName: string;
    arguments: Record<string, unknown>;
  }>;
  usage?: ProviderUsage;
  raw?: unknown;
  error?: string;
}

export interface ProviderCapabilities {
  textGeneration: boolean;
  streaming: boolean;
  toolCalling: boolean;
  vision: boolean;
  audio: boolean;
  contextWindowTokens: number;
}

export interface ProviderHealthStatus {
  ok: boolean;
  latencyMs: number;
  message?: string;
  providerName: string;
  model?: string;
}

/**
 * AIProvider Contract: Fundamental gateway interface implemented by all model providers.
 */
export interface AIProvider {
  readonly providerName: string;

  /**
   * Initializes network bindings and validates SDK credentials or local endpoint reachability.
   */
  initialize(): Promise<void>;

  /**
   * Generates a conversational or task completion response.
   */
  generate(messages: ProviderMessage[] | string, options?: ProviderGenerateOptions): Promise<ProviderResponse>;

  /**
   * Generates a response while optionally transmitting partial tokens to an onChunk subscriber.
   */
  generateStream(
    messages: ProviderMessage[] | string,
    options?: ProviderGenerateOptions,
    onChunk?: (chunk: string) => void
  ): Promise<ProviderResponse>;

  /**
   * Queries provider hardware and feature capabilities.
   */
  getCapabilities(): ProviderCapabilities;

  /**
   * Performs an immediate diagnostic connectivity verification.
   */
  healthCheck(): Promise<ProviderHealthStatus>;
}
