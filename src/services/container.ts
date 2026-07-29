import type { ServiceToken } from './tokens';
import { SystemError } from '../core/errors/error-types';

export type ServiceFactory<T> = (container: IServiceContainer) => T;

export interface IServiceContainer {
  registerInstance<T>(token: ServiceToken<T>, instance: T): void;
  registerSingleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void;
  registerTransient<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void;
  
  resolve<T>(token: ServiceToken<T>): T;
  tryResolve<T>(token: ServiceToken<T>): T | undefined;
  has<T>(token: ServiceToken<T>): boolean;
  
  clear(): void;
  createChildContainer(): IServiceContainer;
}

interface ServiceDescriptor {
  type: 'instance' | 'singleton' | 'transient';
  factory?: ServiceFactory<unknown>;
  instance?: unknown;
}

/**
 * ServiceContainer: Lightweight dependency injection registry.
 * Eliminates global state coupling by managing lifetimes (Instance, Singleton, Transient) and child scopes.
 */
export class ServiceContainer implements IServiceContainer {
  private readonly registry = new Map<symbol, ServiceDescriptor>();
  private readonly parent?: ServiceContainer;

  constructor(parent?: ServiceContainer) {
    this.parent = parent;
  }

  public registerInstance<T>(token: ServiceToken<T>, instance: T): void {
    this.registry.set(token.key, {
      type: 'instance',
      instance,
    });
  }

  public registerSingleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void {
    this.registry.set(token.key, {
      type: 'singleton',
      factory: factory as ServiceFactory<unknown>,
    });
  }

  public registerTransient<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void {
    this.registry.set(token.key, {
      type: 'transient',
      factory: factory as ServiceFactory<unknown>,
    });
  }

  public resolve<T>(token: ServiceToken<T>): T {
    const instance = this.tryResolve(token);
    if (instance === undefined) {
      throw new SystemError(
        `Service '${token.name}' is not registered in the DI ServiceContainer.`,
        'SERVICE_NOT_FOUND',
        { details: { token: token.name } }
      );
    }
    return instance;
  }

  public tryResolve<T>(token: ServiceToken<T>): T | undefined {
    const descriptor = this.registry.get(token.key);

    if (!descriptor) {
      if (this.parent) {
        return this.parent.tryResolve(token);
      }
      return undefined;
    }

    if (descriptor.type === 'instance' && descriptor.instance !== undefined) {
      return descriptor.instance as T;
    }

    if (descriptor.type === 'singleton') {
      if (descriptor.instance === undefined && descriptor.factory) {
        descriptor.instance = descriptor.factory(this);
      }
      return descriptor.instance as T;
    }

    if (descriptor.type === 'transient' && descriptor.factory) {
      return descriptor.factory(this) as T;
    }

    return undefined;
  }

  public has<T>(token: ServiceToken<T>): boolean {
    return this.registry.has(token.key) || (this.parent?.has(token) ?? false);
  }

  public clear(): void {
    this.registry.clear();
  }

  public createChildContainer(): IServiceContainer {
    return new ServiceContainer(this);
  }
}
