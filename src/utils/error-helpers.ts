import { AIOSError } from '../core/errors/error-types';

/**
 * Helper utilities for type-safe error identification and diagnostic serialization.
 */

/**
 * Type guard to verify if an unknown catch variable is an instance of AIOSError.
 */
export function isAIOSError(error: unknown): error is AIOSError {
  return error instanceof AIOSError;
}

/**
 * Safely converts any thrown variable (string, plain object, Error instance) into a standardized Error.
 */
export function toError(maybeError: unknown): Error {
  if (maybeError instanceof Error) {
    return maybeError;
  }
  if (typeof maybeError === 'string') {
    return new Error(maybeError);
  }
  if (maybeError && typeof maybeError === 'object' && 'message' in maybeError) {
    return new Error(String((maybeError as { message: unknown }).message));
  }
  return new Error(`Unknown error value: ${JSON.stringify(maybeError)}`);
}

/**
 * Formats any caught error into a standardized structure for centralized logging or telemetry serialization.
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (isAIOSError(error)) {
    return error.toJSON();
  }

  const standardized = toError(error);
  return {
    name: standardized.name || 'Error',
    message: standardized.message,
    stack: standardized.stack,
    timestamp: new Date().toISOString(),
  };
}
