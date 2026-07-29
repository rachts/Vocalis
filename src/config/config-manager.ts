import type { AIOSConfig, ProviderSettings, MemoryConfig, VoiceConfig, LoggingConfig, SystemConfig } from './schema';
import type { DeepPartial } from '../types/common';
import { defaultAIOSConfig } from './defaults';

/**
 * IConfigManager contract: Centralized configuration authority across Vocalis AI Operating System.
 * Avoids direct process.env reads across operational components.
 */
export interface IConfigManager {
  getConfig(): AIOSConfig;
  getSystemConfig(): SystemConfig;
  getProviderSettings(providerName: string): ProviderSettings | undefined;
  getMemoryConfig(): MemoryConfig;
  getVoiceConfig(): VoiceConfig;
  getLoggingConfig(): LoggingConfig;
  override(updates: DeepPartial<AIOSConfig>): void;
  reset(): void;
}

/**
 * ConfigManager Service: Manages configuration state, environment overrides, and immutable runtime updates.
 */
export class ConfigManager implements IConfigManager {
  private config: AIOSConfig;

  constructor(initialOverrides?: DeepPartial<AIOSConfig>) {
    this.config = JSON.parse(JSON.stringify(defaultAIOSConfig));
    this.applyEnvironmentOverrides();
    if (initialOverrides) {
      this.override(initialOverrides);
    }
  }

  public getConfig(): AIOSConfig {
    // Return an immutable snapshot copy to prevent uncontrolled direct property mutations
    return JSON.parse(JSON.stringify(this.config));
  }

  public getSystemConfig(): SystemConfig {
    return { ...this.config.system };
  }

  public getProviderSettings(providerName: string): ProviderSettings | undefined {
    const settings = this.config.providers.settings[providerName];
    return settings ? { ...settings } : undefined;
  }

  public getMemoryConfig(): MemoryConfig {
    return { ...this.config.memory };
  }

  public getVoiceConfig(): VoiceConfig {
    return { ...this.config.voice };
  }

  public getLoggingConfig(): LoggingConfig {
    return { ...this.config.logging };
  }

  public override(updates: DeepPartial<AIOSConfig>): void {
    this.config = this.mergeDeep(
      this.config as unknown as Record<string, unknown>,
      updates as unknown as Record<string, unknown>
    ) as unknown as AIOSConfig;
  }

  public reset(): void {
    this.config = JSON.parse(JSON.stringify(defaultAIOSConfig));
    this.applyEnvironmentOverrides();
  }

  private applyEnvironmentOverrides(): void {
    if (typeof process === 'undefined' || !process.env) {
      return;
    }

    const env = process.env;

    if (env.GEMINI_API_KEY && this.config.providers.settings.gemini) {
      this.config.providers.settings.gemini.apiKey = env.GEMINI_API_KEY;
    }
    if (env.OPENAI_API_KEY && this.config.providers.settings.openai) {
      this.config.providers.settings.openai.apiKey = env.OPENAI_API_KEY;
    }
    if (env.ANTHROPIC_API_KEY && this.config.providers.settings.claude) {
      this.config.providers.settings.claude.apiKey = env.ANTHROPIC_API_KEY;
    }
    if (env.DEEPGRAM_API_KEY) {
      this.config.voice.sttModel = env.DEEPGRAM_MODEL || this.config.voice.sttModel;
    }
    if (env.LOG_LEVEL !== undefined && !isNaN(Number(env.LOG_LEVEL))) {
      this.config.logging.minLevel = Number(env.LOG_LEVEL);
    }
  }

  private mergeDeep(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (this.isObject(sourceVal) && this.isObject(targetVal)) {
          output[key] = this.mergeDeep(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>);
        } else if (sourceVal !== undefined) {
          output[key] = sourceVal;
        }
      });
    }
    return output;
  }

  private isObject(item: unknown): boolean {
    return Boolean(item && typeof item === 'object' && !Array.isArray(item));
  }
}

/**
 * Factory helper for clean container initialization or standalone test fixtures.
 */
export function createConfigManager(overrides?: DeepPartial<AIOSConfig>): IConfigManager {
  return new ConfigManager(overrides);
}
