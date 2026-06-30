import * as fs from 'fs';
import * as path from 'path';
import { Agent } from './types';
import { Logger } from '../utils/logger';

const STATE_FILE = path.resolve(process.cwd(), '.vocalis-state.json');

interface PersistedState {
  agents: Agent[];
  savedAt: string;
}

/**
 * Persistence — JSON file-based state serialization for the AgentRuntime.
 * Saves agent state on every status change, restores on startup.
 */
class PersistenceManager {
  save(runtime: { getAll: () => Agent[] }) {
    try {
      const state: PersistedState = {
        agents: runtime.getAll(),
        savedAt: new Date().toISOString(),
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err: any) {
      Logger.warn(`[Persistence] Failed to save state: ${err.message}`);
    }
  }

  restore(): Agent[] {
    try {
      if (!fs.existsSync(STATE_FILE)) return [];

      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const state: PersistedState = JSON.parse(raw);

      Logger.info(`[Persistence] Loaded state from ${state.savedAt}`);

      // Only restore agents that were mid-flight — mark them as PAUSED
      // so the dashboard shows them, but they don't auto-restart
      const recoverable = state.agents.filter(
        a => a.status === 'RUNNING' || a.status === 'PAUSED'
      );

      for (const agent of recoverable) {
        agent.status = 'PAUSED'; // requires manual re-trigger
        agent.executionHistory.push({
          timestamp: Date.now(),
          event: 'recovered_after_restart',
        });
      }

      return state.agents; // return ALL for dashboard visibility
    } catch (err: any) {
      Logger.warn(`[Persistence] Failed to restore state: ${err.message}`);
      return [];
    }
  }
}

export const persistence = new PersistenceManager();
