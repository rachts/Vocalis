import { ServiceContainer, type IServiceContainer } from './container';
import { AIOSTokens } from './tokens';
import { ConfigManager } from '../config/config-manager';
import type { AIOSConfig } from '../config/schema';
import type { DeepPartial } from '../types/common';
import { createEventBus } from '../core/events/event-bus';
import { LoggerService } from '../core/logging/logger-service';
import { ConsoleTransport, FileTransport } from '../core/logging/transports';
import { createToolRegistry } from '../core/tools/tool-registry';

/**
 * Bootstraps the foundational Vocalis OS Infrastructure within a clean Dependency Injection Container.
 * All modules decouple cleanly from global state and interact via interfaces.
 */
export function bootstrapAIOS(userConfig?: DeepPartial<AIOSConfig>): IServiceContainer {
  const container = new ServiceContainer();

  // 1. Configuration
  const configManager = new ConfigManager(userConfig);
  container.registerInstance(AIOSTokens.CONFIG, configManager);

  // 2. Event Bus
  const eventBus = createEventBus();
  container.registerInstance(AIOSTokens.EVENT_BUS, eventBus);

  // 3. Logger Service & Pluggable Transports
  const logConfig = configManager.getLoggingConfig();
  const transports = [];
  
  if (logConfig.consoleEnabled) {
    transports.push(new ConsoleTransport(logConfig.minLevel));
  }
  if (logConfig.fileLoggingEnabled && logConfig.logFilePath) {
    transports.push(new FileTransport(logConfig.logFilePath, logConfig.minLevel));
  }
  
  const logger = new LoggerService({ level: logConfig.minLevel, transports });
  container.registerInstance(AIOSTokens.LOGGER, logger);

  // 4. Tool Registry
  const toolRegistry = createToolRegistry({ logger, eventBus });
  container.registerInstance(AIOSTokens.TOOL_REGISTRY, toolRegistry);

  // Inform OS telemetry that core foundation completed bootstrapping
  const sysConfig = configManager.getSystemConfig();
  logger.info('Vocalis AI OS Core Foundation successfully bootstrapped in DI Container.', {
    environment: sysConfig.environment,
    version: sysConfig.version,
  });

  return container;
}
