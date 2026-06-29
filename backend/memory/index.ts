import { Logger } from '../utils/logger';
import { eventBus, SystemEvents } from '../events/bus';

export interface IMemoryStore {
  store(key: string, value: any): Promise<void>;
  retrieve(key: string): Promise<any>;
  search(query: string): Promise<any[]>;
  getAll(): Promise<Record<string, any>>;
}

/**
 * Basic In-Memory store for Phase 2.
 * Future: Abstract to SQLite, PostgreSQL, or Vector DB.
 */
class InMemoryStore implements IMemoryStore {
  private data: Map<string, any> = new Map();

  async store(key: string, value: any): Promise<void> {
    this.data.set(key, value);
    Logger.info(`Memory stored: [${key}]`, value);
    eventBus.emit(SystemEvents.MemoryStored, { key, value });
  }

  async retrieve(key: string): Promise<any> {
    const value = this.data.get(key);
    if (value) {
      Logger.info(`Memory retrieved: [${key}]`);
      eventBus.emit(SystemEvents.MemoryRetrieved, { key, value });
    }
    return value;
  }

  async search(query: string): Promise<any[]> {
    // Basic substring search across all values if they are strings
    const results: any[] = [];
    for (const [key, value] of this.data.entries()) {
      if (typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())) {
        results.push({ key, value });
      } else if (typeof value === 'object') {
        if (JSON.stringify(value).toLowerCase().includes(query.toLowerCase())) {
          results.push({ key, value });
        }
      }
    }
    return results;
  }

  async getAll(): Promise<Record<string, any>> {
    const all: Record<string, any> = {};
    for (const [k, v] of this.data.entries()) {
      all[k] = v;
    }
    return all;
  }
}

export const memoryStore = new InMemoryStore();
