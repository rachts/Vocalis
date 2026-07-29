import { LogLevel } from '../core/logging/logger-interface';
import type { AIOSConfig } from './schema';

/**
 * Production-ready default configuration settings for Vocalis AI Operating System.
 * Aligns with existing system defaults while preparing integration parameters for all future engines.
 */
export const defaultAIOSConfig: AIOSConfig = {
  system: {
    environment: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') ? 'production' : 'development',
    version: '2.0.0-os-alpha',
    debugEnabled: true,
    maxParallelTools: 5,
    defaultExecutionTimeoutMs: 30000,
  },
  providers: {
    defaultProvider: 'gemini',
    fallbackProvider: 'openai',
    settings: {
      gemini: {
        defaultModel: 'gemini-2.5-pro',
        timeoutMs: 25000,
        maxRetries: 3,
        temperature: 0.7,
      },
      openai: {
        defaultModel: 'gpt-4o',
        timeoutMs: 25000,
        maxRetries: 3,
        temperature: 0.7,
      },
      claude: {
        defaultModel: 'claude-3-5-sonnet-20241022',
        timeoutMs: 25000,
        maxRetries: 3,
        temperature: 0.7,
      },
      ollama: {
        baseURL: 'http://localhost:11434',
        defaultModel: 'llama3',
        timeoutMs: 60000,
        maxRetries: 1,
        temperature: 0.7,
      },
      lmstudio: {
        baseURL: 'http://localhost:1234/v1',
        defaultModel: 'local-model',
        timeoutMs: 60000,
        maxRetries: 1,
        temperature: 0.7,
      },
    },
  },
  memory: {
    defaultAdapter: 'memory',
    sessionTtlMs: 3600000, // 1 hour
    maxConversationTurns: 100,
    vectorDimensions: 1536,
  },
  voice: {
    sttProvider: 'deepgram',
    sttModel: 'nova-2',
    ttsProvider: 'elevenlabs',
    ttsModel: 'eleven_multilingual_v2',
    defaultVoiceId: '21m00Tcm4TlvDq8ikWAM', // Standard ElevenLabs sample voice ID
    defaultLanguage: 'en-US',
    sampleRate: 16000,
    vadSensitivity: 0.5,
    speechRate: 1.0,
    speechPitch: 1.0,
    streamingEnabled: true,
  },
  logging: {
    minLevel: LogLevel.DEBUG,
    consoleEnabled: true,
    fileLoggingEnabled: false,
    logFilePath: './vocalis-os.log',
    telemetryEnabled: false,
  },
};
