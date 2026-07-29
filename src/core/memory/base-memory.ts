import type { ID, Metadata } from '../../types/common';
import type { MemoryItem, MemoryMessage, KnowledgeItem, ConversationTurn, MemoryQueryFilter } from './memory-types';
import type { ISessionMemory, ILongTermMemory, IKnowledgeMemory, IConversationStore, IMemoryProvider } from './memory-interfaces';
import type { IEventBus } from '../events/event-bus';
import { AIOSEventTypes } from '../events/event-types';
import { generateId } from '../../utils/id-generator';

/**
 * EphemeralSessionMemory: Complete in-memory implementation for short-term working RAM per session.
 */
export class EphemeralSessionMemory implements ISessionMemory {
  public readonly sessionId: ID;
  private readonly store = new Map<string, unknown>();
  private readonly history: MemoryMessage[] = [];
  private readonly eventBus?: IEventBus;

  constructor(sessionId: ID, options?: { eventBus?: IEventBus }) {
    this.sessionId = sessionId;
    this.eventBus = options?.eventBus;
  }

  public get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  public set<T>(key: string, value: T): void {
    this.store.set(key, value);
    this.eventBus?.emit(AIOSEventTypes.MEMORY_UPDATED, {
      storeType: 'session',
      operation: 'update',
      keyOrId: key,
    }, `session:${this.sessionId}`);
  }

  public delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.eventBus?.emit(AIOSEventTypes.MEMORY_UPDATED, {
        storeType: 'session',
        operation: 'delete',
        keyOrId: key,
      }, `session:${this.sessionId}`);
    }
    return deleted;
  }

  public clear(): void {
    this.store.clear();
    this.history.length = 0;
    this.eventBus?.emit(AIOSEventTypes.MEMORY_UPDATED, {
      storeType: 'session',
      operation: 'clear',
    }, `session:${this.sessionId}`);
  }

  public getHistory(): MemoryMessage[] {
    return [...this.history];
  }

  public appendMessage(message: MemoryMessage): void {
    this.history.push(message);
    this.eventBus?.emit(AIOSEventTypes.MEMORY_UPDATED, {
      storeType: 'session',
      operation: 'insert',
      recordCount: this.history.length,
    }, `session:${this.sessionId}`);
  }
}

/**
 * Abstract foundational classes preparing Phase 2 storage persistence without coupling to active databases.
 */

export abstract class BaseLongTermMemory implements ILongTermMemory {
  protected readonly eventBus?: IEventBus;
  constructor(options?: { eventBus?: IEventBus }) {
    this.eventBus = options?.eventBus;
  }

  public abstract retrieve(query: string, limit?: number, filter?: MemoryQueryFilter): Promise<MemoryItem[]>;
  public abstract store(item: Omit<MemoryItem, 'id' | 'createdAt'> & { id?: ID }): Promise<ID>;
  public abstract delete(id: ID): Promise<boolean>;
  public abstract update(id: ID, updates: Partial<MemoryItem>): Promise<boolean>;
}

export abstract class BaseKnowledgeMemory implements IKnowledgeMemory {
  protected readonly eventBus?: IEventBus;
  constructor(options?: { eventBus?: IEventBus }) {
    this.eventBus = options?.eventBus;
  }

  public abstract search(query: string, topK?: number, filter?: MemoryQueryFilter): Promise<KnowledgeItem[]>;
  public abstract ingest(content: string, metadata?: Metadata, vector?: number[]): Promise<ID>;
  public abstract delete(id: ID): Promise<boolean>;
}

export abstract class BaseConversationStore implements IConversationStore {
  protected readonly eventBus?: IEventBus;
  constructor(options?: { eventBus?: IEventBus }) {
    this.eventBus = options?.eventBus;
  }

  public abstract saveTurn(sessionId: ID, turn: Omit<ConversationTurn, 'id' | 'sessionId' | 'timestamp'>): Promise<ID>;
  public abstract getTurns(sessionId: ID, limit?: number, offset?: number): Promise<ConversationTurn[]>;
  public abstract deleteSession(sessionId: ID): Promise<boolean>;
}

/**
 * BaseMemoryProvider: Central registry factory managing ephemeral session caches and storage drivers.
 */
export abstract class BaseMemoryProvider implements IMemoryProvider {
  private readonly sessions = new Map<ID, ISessionMemory>();
  protected readonly eventBus?: IEventBus;

  constructor(options?: { eventBus?: IEventBus }) {
    this.eventBus = options?.eventBus;
  }

  public getSessionMemory(sessionId: ID): ISessionMemory {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new EphemeralSessionMemory(sessionId, { eventBus: this.eventBus }));
    }
    return this.sessions.get(sessionId)!;
  }

  public abstract getLongTermMemory(): ILongTermMemory;
  public abstract getKnowledgeMemory(): IKnowledgeMemory;
  public abstract getConversationStore(): IConversationStore;
}
