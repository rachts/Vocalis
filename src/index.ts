/**
 * Vocalis AI Operating System - Universal Entrypoint & Architecture Exporter.
 * 
 * Provides clean architectural abstractions, modular dependency injection, 
 * event messaging, and structured capability planning while preserving all existing application logic.
 */

// Root Facade
export * from './aios';

// Domain Types and Utilities
export * from './types/common';
export * from './utils/id-generator';
export * from './utils/async-utils';
export * from './utils/error-helpers';

// Configuration Layer
export * from './config/schema';
export * from './config/defaults';
export * from './config/config-manager';
export * from './config/index';

// Core Subsystems & Interfaces
export * from './core/errors/error-types';
export * from './core/events';
export * from './core/logging';
export * from './core/providers';
export * from './core/tools';
export * from './core/planner';
export * from './core/memory';
export * from './core/workflow';

// Specialized Domain Layers
export * from './agents';
export * from './voice';

// Dependency Injection Service Container
export * from './services';
