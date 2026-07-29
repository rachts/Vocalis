import type { ID, Timestamp, Metadata } from '../../types/common';
import type { ModelRole } from '../providers/provider-interface';

/**
 * Foundational type definitions for the Vocalis Multi-Tier Memory architecture.
 */

export interface MemoryItem {
  id: ID;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  metadata?: Metadata;
}

export interface MemoryMessage {
  role: ModelRole;
  content: string | unknown[];
  timestamp: Timestamp;
  metadata?: Metadata;
}

export interface KnowledgeItem {
  id: ID;
  content: string;
  vector?: number[];
  similarity?: number;
  metadata?: Metadata;
}

export interface ConversationTurn {
  id: ID;
  sessionId: ID;
  userMessage: MemoryMessage;
  assistantMessage: MemoryMessage;
  toolCalls?: Array<{ toolName: string; arguments: Record<string, unknown>; result?: unknown }>;
  timestamp: Timestamp;
  metadata?: Metadata;
}

export interface MemoryQueryFilter {
  sessionId?: ID;
  userId?: ID;
  tags?: string[];
  startDate?: Timestamp;
  endDate?: Timestamp;
  metadata?: Metadata;
}
