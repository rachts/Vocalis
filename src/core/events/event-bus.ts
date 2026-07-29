import { generateId } from '../../utils/id-generator';
import type { AIOSEventType, AIOSEvent, EventListener, Unsubscribe } from './event-types';
import type { Metadata } from '../../types/common';

/**
 * IEventBus: The foundational contract for inter-module event communication in Vocalis AI OS.
 * Decouples domain services (Voice, Planner, Providers, Tools, Memory) from direct mutual imports.
 */
export interface IEventBus {
  /**
   * Subscribe to an event type. Supports `'*'` wildcard matching for all events.
   * Returns a synchronous unsubscription handle.
   */
  on<T = unknown>(eventType: AIOSEventType, listener: EventListener<T>): Unsubscribe;

  /**
   * Subscribe to an event type for a single occurrence.
   */
  once<T = unknown>(eventType: AIOSEventType, listener: EventListener<T>): Unsubscribe;

  /**
   * Explicitly remove a previously registered listener.
   */
  off<T = unknown>(eventType: AIOSEventType, listener: EventListener<T>): void;

  /**
   * Synchronously dispatch an event to all registered subscribers.
   * Errors thrown by individual listeners are safely trapped and reported without interrupting subsequent subscribers.
   */
  emit<T = unknown>(eventType: AIOSEventType, payload: T, source?: string, metadata?: Metadata): AIOSEvent<T>;

  /**
   * Asynchronously dispatch an event and await resolution of all subscriber callbacks.
   */
  emitAsync<T = unknown>(eventType: AIOSEventType, payload: T, source?: string, metadata?: Metadata): Promise<AIOSEvent<T>>;

  /**
   * Remove all listeners for a specific event type, or entirely clear all event listeners across the bus.
   */
  clear(eventType?: AIOSEventType): void;
}

/**
 * Production-ready implementation of IEventBus with robust error isolation, wildcard routing,
 * and memory-leak prevention.
 */
export class InternalEventBus implements IEventBus {
  private readonly listeners = new Map<AIOSEventType, Set<EventListener<unknown>>>();
  private readonly busId = generateId('eventbus');

  public on<T = unknown>(eventType: AIOSEventType, listener: EventListener<T>): Unsubscribe {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const set = this.listeners.get(eventType)!;
    const universalListener = listener as EventListener<unknown>;
    set.add(universalListener);

    return () => this.off(eventType, listener);
  }

  public once<T = unknown>(eventType: AIOSEventType, listener: EventListener<T>): Unsubscribe {
    const wrappedListener: EventListener<T> = async (event) => {
      this.off(eventType, wrappedListener);
      return listener(event);
    };
    return this.on(eventType, wrappedListener);
  }

  public off<T = unknown>(eventType: AIOSEventType, listener: EventListener<T>): void {
    const set = this.listeners.get(eventType);
    if (!set) {
      return;
    }
    set.delete(listener as EventListener<unknown>);
    if (set.size === 0) {
      this.listeners.delete(eventType);
    }
  }

  public emit<T = unknown>(eventType: AIOSEventType, payload: T, source = 'system', metadata?: Metadata): AIOSEvent<T> {
    const event: AIOSEvent<T> = {
      id: generateId('evt'),
      type: eventType,
      timestamp: Date.now(),
      source,
      payload,
      metadata,
    };

    const targetListeners = this.getMatchingListeners(eventType);
    for (const listener of targetListeners) {
      try {
        const result = listener(event as AIOSEvent<unknown>);
        if (result instanceof Promise) {
          result.catch((error) => this.handleListenerError(error, eventType));
        }
      } catch (error) {
        this.handleListenerError(error, eventType);
      }
    }

    return event;
  }

  public async emitAsync<T = unknown>(
    eventType: AIOSEventType,
    payload: T,
    source = 'system',
    metadata?: Metadata
  ): Promise<AIOSEvent<T>> {
    const event: AIOSEvent<T> = {
      id: generateId('evt'),
      type: eventType,
      timestamp: Date.now(),
      source,
      payload,
      metadata,
    };

    const targetListeners = this.getMatchingListeners(eventType);
    const promises: Promise<void>[] = [];

    for (const listener of targetListeners) {
      try {
        const result = listener(event as AIOSEvent<unknown>);
        if (result instanceof Promise) {
          promises.push(
            result.catch((error) => {
              this.handleListenerError(error, eventType);
            })
          );
        }
      } catch (error) {
        this.handleListenerError(error, eventType);
      }
    }

    await Promise.all(promises);
    return event;
  }

  public clear(eventType?: AIOSEventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  private getMatchingListeners(eventType: AIOSEventType): Array<EventListener<unknown>> {
    const matched = new Set<EventListener<unknown>>();
    
    // Exact match listeners
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.forEach((l) => matched.add(l));
    }
    
    // Wildcard ('*') subscribers
    if (eventType !== '*' && this.listeners.has('*')) {
      this.listeners.get('*')!.forEach((l) => matched.add(l));
    }

    return Array.from(matched);
  }

  private handleListenerError(error: unknown, eventType: AIOSEventType): void {
    // We isolate errors so an exception in a listener never aborts the event bus dispatch cycle.
    const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[InternalEventBus:${this.busId}] Unhandled exception in listener for event '${eventType}':`, errorMessage);
    }
  }
}

/**
 * Factory helper for creating new EventBus instances.
 */
export function createEventBus(): IEventBus {
  return new InternalEventBus();
}

