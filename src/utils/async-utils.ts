/**
 * Production asynchronous utility helpers for timing, resilience, and rate-limit mitigation.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Pause asynchronous execution for a specified duration in milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps an asynchronous operation with an explicit execution timeout.
 * Rejects with a Error if the duration expires before resolution.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName = 'Operation'): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Timeout exceeded: ${operationName} did not complete within ${timeoutMs}ms.`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
}

/**
 * Executes a function with exponential backoff retries upon failure.
 * Essential for communication with transient external provider APIs (AI models, Speech services).
 */
export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelay = options?.initialDelayMs ?? 500;
  const maxDelay = options?.maxDelayMs ?? 10000;
  const backoffFactor = options?.backoffFactor ?? 2;
  const shouldRetry = options?.shouldRetry ?? (() => true);

  let currentDelay = initialDelay;
  let lastError: Error = new Error('Operation failed without explicit error representation.');

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt > maxRetries || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Calculate jittered delay to prevent thundering herd API hits
      const jitter = Math.random() * 0.2 * currentDelay;
      const waitTime = Math.min(currentDelay + jitter, maxDelay);
      
      await sleep(waitTime);
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Simple debounce wrapping for frequent event dispatches or telemetry checkpoints.
 */
export function debounce<T extends (...args: unknown[]) => void>(func: T, waitMs: number): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: unknown[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, waitMs);
  }) as unknown as T;
}
