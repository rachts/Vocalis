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
  WorkflowStarted = 'WorkflowStarted',
  WorkflowStepStarted = 'WorkflowStepStarted',
  WorkflowStepCompleted = 'WorkflowStepCompleted',
  WorkflowStepFailed = 'WorkflowStepFailed',
  WorkflowCompleted = 'WorkflowCompleted',
  TaskCompleted = 'TaskCompleted',
  NotificationTriggered = 'NotificationTriggered',
  // Agent Framework events
  AgentCreated = 'AgentCreated',
  AgentStarted = 'AgentStarted',
  AgentPaused = 'AgentPaused',
  AgentCompleted = 'AgentCompleted',
  AgentFailed = 'AgentFailed',
  AgentCancelled = 'AgentCancelled',
  TaskDelegated = 'TaskDelegated',
  WorkflowRecovered = 'WorkflowRecovered',
}
