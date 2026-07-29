import type { ID, Metadata } from '../../types/common';
import type { MemoryItem, MemoryMessage, KnowledgeItem, ConversationTurn, MemoryQueryFilter } from './memory-types';

/**
 * Core interface contracts across the four pillars of Vocalis Memory architecture.
 */

/**
 * ISessionMemory: High-speed per-session short term workspace memory and conversational scratchpad.
 */
export interface ISessionMemory {
  readonly sessionId: ID;
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): boolean;
  clear(): void;
  getHistory(): MemoryMessage[];
  appendMessage(message: MemoryMessage): void;
}

/**
 * ILongTermMemory: Persistent key-value or document storage across session life cycles.
 */
export interface ILongTermMemory {
  retrieve(query: string, limit?: number, filter?: MemoryQueryFilter): Promise<MemoryItem[]>;
  store(item: Omit<MemoryItem, 'id' | 'createdAt'> & { id?: ID }): Promise<ID>;
  delete(id: ID): Promise<boolean>;
  update(id: ID, updates: Partial<MemoryItem>): Promise<boolean>;
}

/**
 * IKnowledgeMemory: Semantic vector indexing and Retrieval Augmented Generation (RAG) storage.
 */
export interface IKnowledgeMemory {
  search(query: string, topK?: number, filter?: MemoryQueryFilter): Promise<KnowledgeItem[]>;
  ingest(content: string, metadata?: Metadata, vector?: number[]): Promise<ID>;
  delete(id: ID): Promise<boolean>;
}

/**
 * IConversationStore: Long-duration dialog repository recording user interactions and assistant turns.
 */
export interface IConversationStore {
  saveTurn(sessionId: ID, turn: Omit<ConversationTurn, 'id' | 'sessionId' | 'timestamp'>): Promise<ID>;
  getTurns(sessionId: ID, limit?: number, offset?: number): Promise<ConversationTurn[]>;
  deleteSession(sessionId: ID): Promise<boolean>;
}

/**
 * IMemoryProvider: Aggregate factory providing cohesive access across all memory sub-layers.
 */
export interface IMemoryProvider {
  getSessionMemory(sessionId: ID): ISessionMemory;
  getLongTermMemory(): ILongTermMemory;
  getKnowledgeMemory(): IKnowledgeMemory;
  getConversationStore(): IConversationStore;
}
