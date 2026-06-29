import { Logger } from '../utils/logger';
import { eventBus, SystemEvents } from '../events/bus';

export enum PermissionStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  PENDING = 'PENDING'
}

export class PermissionManager {
  private cache: Map<string, PermissionStatus> = new Map();

  async requestPermission(toolName: string, args: any): Promise<boolean> {
    const key = this.getCacheKey(toolName, args);
    const cached = this.cache.get(key);
    
    if (cached === PermissionStatus.GRANTED) return true;
    if (cached === PermissionStatus.DENIED) return false;

    Logger.info(`Permission requested for ${toolName}`, args);
    eventBus.emit(SystemEvents.PermissionRequested, { toolName, args });

    // For Phase 2, we simulate an automatic approval after logging.
    // Future: Wait for frontend user interaction via WebSockets.
    
    this.cache.set(key, PermissionStatus.GRANTED);
    eventBus.emit(SystemEvents.PermissionGranted, { toolName, args });
    Logger.info(`Permission granted for ${toolName}`);
    
    return true;
  }

  private getCacheKey(toolName: string, args: any): string {
    return `${toolName}_${JSON.stringify(args)}`;
  }
}

export const permissionManager = new PermissionManager();
