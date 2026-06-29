import { EventEmitter } from 'events';

class EventBus extends EventEmitter {}

export const eventBus = new EventBus();

// Strongly typed event names
export enum SystemEvents {
  ToolExecuted = 'ToolExecuted',
  ConversationStarted = 'ConversationStarted',
  ConversationEnded = 'ConversationEnded',
  MemoryStored = 'MemoryStored',
  MemoryRetrieved = 'MemoryRetrieved',
  PermissionRequested = 'PermissionRequested',
  PermissionGranted = 'PermissionGranted',
  BackgroundJobCompleted = 'BackgroundJobCompleted',
  LatencyMetric = 'LatencyMetric',
}
