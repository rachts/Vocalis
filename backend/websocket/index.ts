import { Server } from 'socket.io';
import { handleSTTConnection } from './sttHandler';
import { eventBus, SystemEvents } from '../events/bus';
import { permissionManager } from '../permissions/manager';

export function registerSocket(io: Server) {
  // Bridge backend events to all connected frontend clients
  const eventBridge = (eventName: SystemEvents) => {
    eventBus.on(eventName, (payload: any) => {
      io.emit(eventName, payload);
    });
  };

  eventBridge(SystemEvents.PermissionRequested);
  eventBridge(SystemEvents.NotificationTriggered);
  eventBridge(SystemEvents.BackgroundJobCompleted);
  // Agent framework events
  eventBridge(SystemEvents.AgentCreated);
  eventBridge(SystemEvents.AgentStarted);
  eventBridge(SystemEvents.AgentCompleted);
  eventBridge(SystemEvents.AgentFailed);
  eventBridge(SystemEvents.AgentPaused);
  eventBridge(SystemEvents.AgentCancelled);
  eventBridge(SystemEvents.TaskDelegated);
  eventBridge(SystemEvents.WorkflowRecovered);
  eventBridge(SystemEvents.TTSAudioChunk);
  eventBridge(SystemEvents.TTSAudioEnd);

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Register STT handlers for this socket
    handleSTTConnection(socket);
    
    // Listen for permission resolution from the frontend UI
    socket.on('permission_response', (payload: { requestId: string, granted: boolean, scope: 'ONCE' | 'SESSION', toolName: string }) => {
      const { requestId, granted, scope, toolName } = payload;
      permissionManager.resolvePermission(requestId, granted, scope);
      if (scope === 'SESSION') {
        permissionManager.setSessionGrant(toolName, granted);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
