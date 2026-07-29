import type { ID, UUID } from '../types/common';

/**
 * Generates a cryptographically sound Version 4 UUID.
 * Works across Node.js runtime and standard Web browser environments.
 */
export function generateUUID(): UUID {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 compliance for older runtime execution contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a namespace-prefixed unique domain identifier.
 * Example: generateId('tool') -> 'tool_8a7d8e2d-3b52'
 */
export function generateId(prefix?: string): ID {
  const uuid = generateUUID();
  if (!prefix) {
    return uuid;
  }
  const shortHash = uuid.replace(/-/g, '').substring(0, 12);
  return `${prefix}_${shortHash}`;
}

/**
 * Generates a deterministic-friendly call tracking identifier for Tool executions and Agent plans.
 */
export function generateCallId(toolOrStepName: string): ID {
  const timestamp = Date.now().toString(36);
  const randomSalt = Math.random().toString(36).substring(2, 7);
  return `call_${toolOrStepName}_${timestamp}_${randomSalt}`;
}
