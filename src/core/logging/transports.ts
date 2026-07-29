import { LogLevel, type LogEntry, type LogTransport } from './logger-interface';
import { formatErrorForLogging } from '../../utils/error-helpers';

/**
 * ConsoleTransport: Formats structured log entries for standard output and debugging consoles.
 */
export class ConsoleTransport implements LogTransport {
  public readonly name = 'ConsoleTransport';
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.DEBUG) {
    this.minLevel = minLevel;
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public log(entry: LogEntry): void {
    if (entry.level < this.minLevel) {
      return;
    }

    const timestamp = entry.timestamp.toISOString();
    const tag = `[${timestamp}] [${entry.levelName}]`;
    const contextStr = entry.context && Object.keys(entry.context).length > 0
      ? ` | context: ${JSON.stringify(entry.context)}`
      : '';
    const errStr = entry.error
      ? ` | error: ${JSON.stringify(formatErrorForLogging(entry.error))}`
      : '';

    const fullMessage = `${tag} ${entry.message}${contextStr}${errStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(fullMessage);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(fullMessage);
        break;
      default:
        break;
    }
  }
}

/**
 * FileTransport: Prepared architecture skeleton for persisting diagnostic stream records to disk or rolling files.
 * Designed to safely check for file system capability (Node.js vs Edge / Client Web environments).
 */
export class FileTransport implements LogTransport {
  public readonly name = 'FileTransport';
  private minLevel: LogLevel;
  private readonly filePath: string;
  private buffer: LogEntry[] = [];
  private readonly flushThreshold = 10;

  constructor(filePath: string, minLevel: LogLevel = LogLevel.INFO) {
    this.filePath = filePath;
    this.minLevel = minLevel;
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public async log(entry: LogEntry): Promise<void> {
    if (entry.level < this.minLevel) {
      return;
    }
    this.buffer.push(entry);
    if (this.buffer.length >= this.flushThreshold) {
      await this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }
    const entriesToFlush = [...this.buffer];
    this.buffer = [];

    // Safely check if we are running in an environment with file system access (Node/Bun/Deno)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        // Dynamic import to avoid bundling breaking errors in Next.js browser builds
        const fs = await import('fs/promises');
        const lines = entriesToFlush
          .map((e) => JSON.stringify({ ...e, timestamp: e.timestamp.toISOString() }) + '\n')
          .join('');
        await fs.appendFile(this.filePath, lines, { encoding: 'utf-8' });
      } catch (e) {
        if (typeof console !== 'undefined' && console.error) {
          console.error(`[FileTransport] Failed writing log entries to disk at ${this.filePath}:`, e);
        }
      }
    }
  }
}

/**
 * TelemetryTransport: Architectural integration point for transmitting structured logs and metrics
 * to monitoring, observability, and APM infrastructure (e.g., OpenTelemetry, Vercel Analytics, Datadog).
 */
export class TelemetryTransport implements LogTransport {
  public readonly name = 'TelemetryTransport';
  private minLevel: LogLevel;
  private readonly endpoint?: string;

  constructor(endpoint?: string, minLevel: LogLevel = LogLevel.WARN) {
    this.endpoint = endpoint;
    this.minLevel = minLevel;
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public log(entry: LogEntry): void {
    if (entry.level < this.minLevel) {
      return;
    }
    // Phase 2: Route structured telemetry payload to ingestion collector or telemetry adapter SDK.
    if (this.endpoint && typeof fetch === 'function') {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'vocalis-ai-os',
          level: entry.levelName,
          timestamp: entry.timestamp.toISOString(),
          message: entry.message,
          context: entry.context,
          error: entry.error ? formatErrorForLogging(entry.error) : undefined,
        }),
        keepalive: true,
      }).catch(() => {
        // Swallow network exceptions in telemetry transport to prevent infinite logging diagnostic recursion
      });
    }
  }
}
