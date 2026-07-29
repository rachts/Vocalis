import type { Metadata } from '../../types/common';

/**
 * Base error structure for all Vocalis AI Operating System errors.
 * Establishes structured debugging, timestamping, code matching, and causal tracing.
 */
export abstract class AIOSError extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  public readonly details?: Metadata;
  public readonly statusCode?: number;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: string = 'AI_OS_GENERIC_ERROR',
    options?: {
      details?: Metadata;
      statusCode?: number;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.code = code;
    this.details = options?.details;
    this.statusCode = options?.statusCode;
    this.cause = options?.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      statusCode: this.statusCode,
      details: this.details,
      cause: this.cause ? { message: this.cause.message, name: this.cause.name } : undefined,
      stack: this.stack,
    };
  }
}

/**
 * AIError: Thrown during model inference, unsupported AI capabilities, or core engine execution failures.
 */
export class AIError extends AIOSError {
  constructor(message: string, code = 'AI_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

/**
 * ToolError: Thrown when a tool fails execution, is missing from the registry, or receives invalid parameters.
 */
export class ToolError extends AIOSError {
  constructor(message: string, code = 'TOOL_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

/**
 * PlannerError: Thrown during task plan synthesis, dependency circularities, or step execution breakdowns.
 */
export class PlannerError extends AIOSError {
  constructor(message: string, code = 'PLANNER_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

/**
 * MemoryError: Thrown when reading, persisting, embedding, or querying across session, long-term, or knowledge memories.
 */
export class MemoryError extends AIOSError {
  constructor(message: string, code = 'MEMORY_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

/**
 * VoiceError: Thrown during speech-to-text, text-to-speech, audio pipeline streaming, or voice activity detection failures.
 */
export class VoiceError extends AIOSError {
  constructor(message: string, code = 'VOICE_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

/**
 * ProviderError: Thrown when communicating with external AI vendor providers (OpenAI, Gemini, Claude, Ollama, LM Studio)
 * such as network timeouts, authentication issues, token budget exhaustion, or rate limiting.
 */
export class ProviderError extends AIOSError {
  constructor(message: string, code = 'PROVIDER_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

/**
 * SystemError: Thrown during dependency container resolution failures, missing tokens, or OS lifecycle initialization.
 */
export class SystemError extends AIOSError {
  constructor(message: string, code = 'SYSTEM_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

/**
 * ConfigurationError: Thrown when illegal configuration overrides, missing required environment variables, or schema mismatches occur.
 */
export class ConfigurationError extends AIOSError {
  constructor(message: string, code = 'CONFIGURATION_ERROR', options?: { details?: Metadata; statusCode?: number; cause?: Error }) {
    super(message, code, options);
  }
}

