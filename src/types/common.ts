/**
 * Common primitive types, generic results, and data structures
 * foundational to the Vocalis AI Operating System architecture.
 */

export type ID = string;
export type UUID = string;
export type Timestamp = number;
export type Metadata = Record<string, unknown>;

/**
 * Represent a standardized execution result across tools, planners, and agents.
 */
export type Result<T, E = Error> =
  | { success: true; data: T; metadata?: Metadata }
  | { success: false; error: E; message: string; code?: string; metadata?: Metadata };

/**
 * Standard pagination options for data queries across memory and persistence providers.
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  nextCursor?: string;
}

/**
 * Helper type for deep partial configuration and metadata overrides.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

