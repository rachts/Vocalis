import { Logger } from '../utils/logger';
import { eventBus, SystemEvents } from '../events/bus';

export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  lastAccessed: string;
  importanceScore: number;
  source: string;
  relatedMemoryIds: string[];
  archived: boolean;
}

export interface IMemoryStore {
  store(entry: Partial<MemoryEntry> & { id: string, content: string }): Promise<MemoryEntry>;
  retrieve(id: string): Promise<MemoryEntry | undefined>;
  search(query: string): Promise<MemoryEntry[]>;
  getAll(): Promise<MemoryEntry[]>;
  update(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry | undefined>;
  delete(id: string): Promise<boolean>;
  archive(id: string): Promise<MemoryEntry | undefined>;
}

/**
 * Basic In-Memory store.
 * Future: Abstract to SQLite, PostgreSQL, or Vector DB.
 */
class InMemoryStore implements IMemoryStore {
  private data: Map<string, MemoryEntry> = new Map();

  async store(entry: Partial<MemoryEntry> & { id: string, content: string }): Promise<MemoryEntry> {
    const newEntry: MemoryEntry = {
      id: entry.id,
      title: entry.title || entry.id,
      content: entry.content,
      category: entry.category || 'KNOWLEDGE',
      timestamp: entry.timestamp || new Date().toISOString(),
      lastAccessed: entry.lastAccessed || new Date().toISOString(),
      importanceScore: entry.importanceScore ?? 50,
      source: entry.source || 'System',
      relatedMemoryIds: entry.relatedMemoryIds || [],
      archived: entry.archived || false,
    };
    
    this.data.set(newEntry.id, newEntry);
    Logger.info(`Memory stored: [${newEntry.id}]`, newEntry);
    eventBus.emit(SystemEvents.MemoryStored, newEntry);
    return newEntry;
  }

  async retrieve(id: string): Promise<MemoryEntry | undefined> {
    const value = this.data.get(id);
    if (value) {
      value.lastAccessed = new Date().toISOString();
      Logger.info(`Memory retrieved: [${id}]`);
      eventBus.emit(SystemEvents.MemoryRetrieved, value);
    }
    return value;
  }

  async search(query: string): Promise<MemoryEntry[]> {
    const results: MemoryEntry[] = [];
    const q = query.toLowerCase();
    for (const value of this.data.values()) {
      if (
        value.title.toLowerCase().includes(q) ||
        value.content.toLowerCase().includes(q) ||
        value.category.toLowerCase().includes(q)
      ) {
        results.push(value);
      }
    }
    return results;
  }

  async getAll(): Promise<MemoryEntry[]> {
    return Array.from(this.data.values());
  }

  async update(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry | undefined> {
    const existing = this.data.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, lastAccessed: new Date().toISOString() };
      this.data.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async delete(id: string): Promise<boolean> {
    const success = this.data.delete(id);
    if (success) {
      Logger.info(`Memory deleted: [${id}]`);
    }
    return success;
  }

  async archive(id: string): Promise<MemoryEntry | undefined> {
    return this.update(id, { archived: true });
  }
}

export const memoryStore = new InMemoryStore();
