import { LogLevel, type LogEntry, type LogTransport, type ILogger } from './logger-interface';
import { ConsoleTransport } from './transports';
import type { Metadata } from '../../types/common';

/**
 * LoggerService: Centralized logging engine managing transport dispatch and contextual scoping.
 * Replaces fragmented ad-hoc console statements with structured telemetry pipelines.
 */
export class LoggerService implements ILogger {
  private transports: LogTransport[] = [];
  private minLevel: LogLevel;
  private readonly baseContext: Metadata;

  constructor(options?: {
    level?: LogLevel;
    transports?: LogTransport[];
    baseContext?: Metadata;
  }) {
    this.minLevel = options?.level ?? LogLevel.DEBUG;
    this.baseContext = options?.baseContext ?? {};
    
    if (options?.transports && options.transports.length > 0) {
      this.transports = [...options.transports];
    } else {
      // Default to ConsoleTransport if none explicitly configured
      this.transports = [new ConsoleTransport(this.minLevel)];
    }
  }

  public setLevel(level: LogLevel): void {
    this.minLevel = level;
    for (const transport of this.transports) {
      if (transport.setMinLevel) {
        transport.setMinLevel(level);
      }
    }
  }

  public addTransport(transport: LogTransport): void {
    if (transport.setMinLevel) {
      transport.setMinLevel(this.minLevel);
    }
    this.transports.push(transport);
  }

  public withContext(context: Metadata): ILogger {
    const mergedContext: Metadata = { ...this.baseContext, ...context };
    const childLogger = new LoggerService({
      level: this.minLevel,
      transports: this.transports,
      baseContext: mergedContext,
    });
    return childLogger;
  }

  public debug(message: string, context?: Metadata, error?: unknown): void {
    this.dispatch(LogLevel.DEBUG, 'DEBUG', message, context, error);
  }

  public info(message: string, context?: Metadata, error?: unknown): void {
    this.dispatch(LogLevel.INFO, 'INFO', message, context, error);
  }

  public warn(message: string, context?: Metadata, error?: unknown): void {
    this.dispatch(LogLevel.WARN, 'WARN', message, context, error);
  }

  public error(message: string, context?: Metadata, error?: unknown): void {
    this.dispatch(LogLevel.ERROR, 'ERROR', message, context, error);
  }

  public fatal(message: string, context?: Metadata, error?: unknown): void {
    this.dispatch(LogLevel.FATAL, 'FATAL', message, context, error);
  }

  private dispatch(
    level: LogLevel,
    levelName: string,
    message: string,
    additionalContext?: Metadata,
    error?: unknown
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const mergedContext: Metadata = {
      ...this.baseContext,
      ...(additionalContext || {}),
    };

    const entry: LogEntry = {
      level,
      levelName,
      message,
      timestamp: new Date(),
      context: Object.keys(mergedContext).length > 0 ? mergedContext : undefined,
      error,
    };

    for (const transport of this.transports) {
      try {
        const result = transport.log(entry);
        if (result instanceof Promise) {
          result.catch(() => {
            // Protect dispatch cycle against async transport rejection
          });
        }
      } catch (e) {
        // Isolate buggy transport implementation from interrupting execution pipeline
      }
    }
  }
}

/**
 * Singleton-free default instance getter if an isolated fallback logger is required prior to container bootstrap.
 */
export function createDefaultLogger(minLevel: LogLevel = LogLevel.DEBUG): ILogger {
  return new LoggerService({ level: minLevel });
}
