import type { LogLevel } from '../core/logging/logger-interface';
import type { Metadata } from '../types/common';

/**
 * Type-safe configuration schemas for the entire Vocalis AI Operating System.
 * Ensures future providers, models, and capabilities are fully configurable without modifying application code.
 */

export type ProviderType = 'gemini' | 'openai' | 'claude' | 'ollama' | 'lmstudio' | 'custom' | string;

export interface ProviderSettings {
  apiKey?: string;
  baseURL?: string;
  defaultModel: string;
  timeoutMs: number;
  maxRetries: number;
  temperature?: number;
  maxTokens?: number;
  additionalHeaders?: Record<string, string>;
  metadata?: Metadata;
}

export interface ProvidersConfig {
  defaultProvider: ProviderType;
  fallbackProvider?: ProviderType;
  settings: Record<string, ProviderSettings>;
}

export interface MemoryConfig {
  defaultAdapter: 'memory' | 'sqlite' | 'vector' | 'supabase';
  sessionTtlMs: number;
  maxConversationTurns: number;
  vectorDimensions: number;
  embeddingModel?: string;
  connectionString?: string;
}

export interface VoiceConfig {
  sttProvider: 'deepgram' | 'web-speech' | 'custom';
  sttModel: string;
  ttsProvider: 'elevenlabs' | 'web-speech' | 'custom';
  ttsModel: string;
  defaultVoiceId: string;
  defaultLanguage: string;
  sampleRate: number;
  vadSensitivity: number;
  speechRate: number;
  speechPitch: number;
  streamingEnabled: boolean;
}

export interface LoggingConfig {
  minLevel: LogLevel;
  consoleEnabled: boolean;
  fileLoggingEnabled: boolean;
  logFilePath?: string;
  telemetryEnabled: boolean;
  telemetryEndpoint?: string;
}

export interface SystemConfig {
  environment: 'development' | 'production' | 'test';
  version: string;
  debugEnabled: boolean;
  maxParallelTools: number;
  defaultExecutionTimeoutMs: number;
}

/**
 * Root unified AI OS configuration architecture.
 */
export interface AIOSConfig {
  system: SystemConfig;
  providers: ProvidersConfig;
  memory: MemoryConfig;
  voice: VoiceConfig;
  logging: LoggingConfig;
  metadata?: Metadata;
}

