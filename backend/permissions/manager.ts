import { Logger } from '../utils/logger';
import { eventBus, SystemEvents } from '../events/bus';
import { randomUUID } from 'crypto';

export enum PermissionStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  PENDING = 'PENDING'
}

type Resolver = (granted: boolean) => void;

export class PermissionManager {
  private cache: Map<string, PermissionStatus> = new Map();
  private pendingRequests: Map<string, Resolver> = new Map();

  async requestPermission(toolName: string, args: any): Promise<boolean> {
    const cacheKey = this.getCacheKey(toolName, args);
    const toolKey = toolName; // For session-level grants
    
    // Check if specifically this args combo is cached, OR if the whole tool is cached
    if (this.cache.get(cacheKey) === PermissionStatus.GRANTED || this.cache.get(toolKey) === PermissionStatus.GRANTED) return true;
    if (this.cache.get(cacheKey) === PermissionStatus.DENIED) return false;

    const requestId = randomUUID();

    Logger.info(`Permission requested for ${toolName}`, args);
    eventBus.emit(SystemEvents.PermissionRequested, { requestId, toolName, args });

    return new Promise((resolve) => {
      this.pendingRequests.set(requestId, resolve);
    });
  }

  resolvePermission(requestId: string, granted: boolean, scope: 'ONCE' | 'SESSION' = 'ONCE') {
    const resolver = this.pendingRequests.get(requestId);
    if (resolver) {
      this.pendingRequests.delete(requestId);
      resolver(granted);
      Logger.info(`Permission ${granted ? 'granted' : 'denied'} for request ${requestId} (Scope: ${scope})`);
    }
  }

  setSessionGrant(toolName: string, granted: boolean) {
    this.cache.set(toolName, granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED);
  }

  private getCacheKey(toolName: string, args: any): string {
    return `${toolName}_${JSON.stringify(args)}`;
  }
}

export const permissionManager = new PermissionManager();
