import type {
  AIProvider,
  ProviderMessage,
  ProviderGenerateOptions,
  ProviderResponse,
  ProviderCapabilities,
  ProviderHealthStatus,
} from './provider-interface';
import { ProviderError } from '../errors/error-types';
import type { ILogger } from '../logging/logger-interface';
import type { IEventBus } from '../events/event-bus';
import { AIOSEventTypes } from '../events/event-types';
import { formatErrorForLogging } from '../../utils/error-helpers';

/**
 * BaseAIProvider: Abstract foundational class for AI provider implementations (Gemini, OpenAI, Claude, etc.).
 * Handles standardized logging, event dispatch, credential validation hooks, and exception wrapping.
 * Does not implement mock reasoning or provider specifics; future phases will extend this class directly.
 */
export abstract class BaseAIProvider implements AIProvider {
  public readonly providerName: string;
  protected readonly capabilities: ProviderCapabilities;
  protected readonly logger?: ILogger;
  protected readonly eventBus?: IEventBus;
  protected initialized = false;

  constructor(
    providerName: string,
    capabilities: ProviderCapabilities,
    options?: {
      logger?: ILogger;
      eventBus?: IEventBus;
    }
  ) {
    this.providerName = providerName;
    this.capabilities = capabilities;
    this.logger = options?.logger?.withContext({ provider: providerName });
    this.eventBus = options?.eventBus;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    try {
      this.logger?.debug(`Initializing provider '${this.providerName}'...`);
      await this.doInitialize();
      this.initialized = true;
      this.logger?.info(`Provider '${this.providerName}' initialized successfully.`);
    } catch (error) {
      const providerError = new ProviderError(`Failed initializing provider '${this.providerName}'`, 'PROVIDER_INIT_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        details: { provider: this.providerName },
      });
      this.logger?.error(`Initialization failure for provider '${this.providerName}'`, undefined, providerError);
      throw providerError;
    }
  }

  public async generate(
    messages: ProviderMessage[] | string,
    options?: ProviderGenerateOptions
  ): Promise<ProviderResponse> {
    await this.ensureInitialized();
    const normalizedMessages = this.normalizeMessages(messages);
    const startTime = Date.now();

    try {
      this.logger?.debug(`Generating response from provider '${this.providerName}'`, {
        messageCount: normalizedMessages.length,
        model: options?.model,
      });

      const response = await this.doGenerate(normalizedMessages, options || {});
      const durationMs = Date.now() - startTime;

      this.logger?.info(`Provider '${this.providerName}' generated response in ${durationMs}ms`, {
        success: response.success,
        tokens: response.usage?.totalTokens,
      });

      return response;
    } catch (error) {
      const providerError = new ProviderError(`Generation failure in provider '${this.providerName}'`, 'PROVIDER_GENERATE_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
        details: { provider: this.providerName, model: options?.model },
      });
      this.logger?.error(`Generation failed in provider '${this.providerName}'`, undefined, providerError);
      throw providerError;
    }
  }

  public async generateStream(
    messages: ProviderMessage[] | string,
    options?: ProviderGenerateOptions,
    onChunk?: (chunk: string) => void
  ): Promise<ProviderResponse> {
    await this.ensureInitialized();
    if (!this.capabilities.streaming) {
      this.logger?.warn(`Provider '${this.providerName}' does not natively support streaming; falling back to synchronous generate.`);
      const result = await this.generate(messages, options);
      if (result.output && onChunk) {
        onChunk(result.output);
      }
      return result;
    }

    const normalizedMessages = this.normalizeMessages(messages);
    try {
      this.logger?.debug(`Starting streaming response from provider '${this.providerName}'`);
      return await this.doGenerateStream(normalizedMessages, options || {}, onChunk);
    } catch (error) {
      const providerError = new ProviderError(`Streaming failure in provider '${this.providerName}'`, 'PROVIDER_STREAM_ERROR', {
        cause: error instanceof Error ? error : new Error(String(error)),
      });
      this.logger?.error(`Stream error in provider '${this.providerName}'`, undefined, providerError);
      throw providerError;
    }
  }

  public getCapabilities(): ProviderCapabilities {
    return { ...this.capabilities };
  }

  public async healthCheck(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const status = await this.doHealthCheck();
      const latencyMs = Date.now() - start;
      const fullStatus: ProviderHealthStatus = {
        ok: status.ok,
        latencyMs,
        message: status.message,
        providerName: this.providerName,
      };

      if (this.eventBus) {
        this.eventBus.emit(AIOSEventTypes.PROVIDER_HEALTH_CHECK, fullStatus, `provider:${this.providerName}`);
      }
      return fullStatus;
    } catch (error) {
      const latencyMs = Date.now() - start;
      return {
        ok: false,
        latencyMs,
        message: `Health check threw exception: ${JSON.stringify(formatErrorForLogging(error))}`,
        providerName: this.providerName,
      };
    }
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  protected normalizeMessages(messages: ProviderMessage[] | string): ProviderMessage[] {
    if (typeof messages === 'string') {
      return [{ role: 'user', content: messages }];
    }
    return [...messages];
  }

  // Abstract extension endpoints for Phase 2 provider SDK implementations
  protected abstract doInitialize(): Promise<void>;
  protected abstract doGenerate(messages: ProviderMessage[], options: ProviderGenerateOptions): Promise<ProviderResponse>;
  protected abstract doGenerateStream(
    messages: ProviderMessage[],
    options: ProviderGenerateOptions,
    onChunk?: (chunk: string) => void
  ): Promise<ProviderResponse>;
  protected abstract doHealthCheck(): Promise<{ ok: boolean; message?: string }>;
}
