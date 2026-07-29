import type { Metadata } from '../../types/common';

/**
 * Log severity levels ordered by escalation priority.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  SILENT = 5,
}

/**
 * Standardized immutable structure for log items across all modules and transports.
 */
export interface LogEntry {
  level: LogLevel;
  levelName: string;
  message: string;
  timestamp: Date;
  context?: Metadata;
  error?: unknown;
}

/**
 * LogTransport contract: Decouples log message formatting and routing (Console, File, Telemetry)
 * from core module instrumentation.
 */
export interface LogTransport {
  readonly name: string;
  log(entry: LogEntry): void | Promise<void>;
  setMinLevel?(level: LogLevel): void;
}

/**
 * Central ILogger interface. Every module in Vocalis communicates diagnostics through this single abstraction.
 */
export interface ILogger {
  debug(message: string, context?: Metadata, error?: unknown): void;
  info(message: string, context?: Metadata, error?: unknown): void;
  warn(message: string, context?: Metadata, error?: unknown): void;
  error(message: string, context?: Metadata, error?: unknown): void;
  fatal(message: string, context?: Metadata, error?: unknown): void;

  /**
   * Creates a child logger with immutable persistent context attributes (e.g., sessionId, providerName).
   */
  withContext(context: Metadata): ILogger;

  /**
   * Register an additional output transport destination at runtime.
   */
  addTransport(transport: LogTransport): void;
  
  /**
   * Set global log filter severity.
   */
  setLevel(level: LogLevel): void;
}
