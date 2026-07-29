import type { ID } from '../types/common';
import type { AudioFormat, AudioStream, TranscriptSegment, VoiceSessionStatus, VoiceSessionConfig } from './voice-types';
import type { ISpeechToTextProvider, ITextToSpeechProvider, IVoiceSession } from './voice-interface';
import type { ILogger } from '../core/logging/logger-interface';
import type { IEventBus } from '../core/events/event-bus';
import { AIOSEventTypes } from '../core/events/event-types';
import { generateId } from '../utils/id-generator';

/**
 * Abstract scaffolding for voice sublayers. Provides event broadcasting and logging hooks
 * without interfering with or altering existing Deepgram, VAD, or WebRTC code.
 */

export abstract class BaseSpeechToTextProvider implements ISpeechToTextProvider {
  public readonly name: string;
  protected readonly logger?: ILogger;
  protected readonly eventBus?: IEventBus;

  constructor(name: string, options?: { logger?: ILogger; eventBus?: IEventBus }) {
    this.name = name;
    this.logger = options?.logger?.withContext({ sttProvider: name });
    this.eventBus = options?.eventBus;
  }

  public abstract startStream(config: { format: AudioFormat }): Promise<AudioStream>;
  public abstract transcribeStream(audio: AudioStream): Promise<AsyncIterable<TranscriptSegment>>;
  public abstract transcribeBuffer(buffer: Uint8Array, format: AudioFormat): Promise<TranscriptSegment[]>;
  public abstract isHealthy(): Promise<boolean>;
}

export abstract class BaseTextToSpeechProvider implements ITextToSpeechProvider {
  public readonly name: string;
  protected readonly logger?: ILogger;
  protected readonly eventBus?: IEventBus;

  constructor(name: string, options?: { logger?: ILogger; eventBus?: IEventBus }) {
    this.name = name;
    this.logger = options?.logger?.withContext({ ttsProvider: name });
    this.eventBus = options?.eventBus;
  }

  public abstract synthesize(text: string, voiceId?: string): Promise<Uint8Array>;
  public abstract synthesizeStream(text: string, voiceId?: string): Promise<AudioStream>;
  public abstract listVoices(): Promise<Array<{ id: string; name: string; language: string }>>;
  public abstract isHealthy(): Promise<boolean>;
}

export abstract class BaseVoiceSession implements IVoiceSession {
  public readonly sessionId: ID;
  public status: VoiceSessionStatus = 'idle';
  protected readonly config: VoiceSessionConfig;
  protected readonly logger?: ILogger;
  protected readonly eventBus?: IEventBus;
  private readonly transcriptListeners = new Set<(segment: TranscriptSegment) => void>();
  private readonly stateListeners = new Set<(status: VoiceSessionStatus) => void>();

  constructor(config: VoiceSessionConfig = {}, options?: { sessionId?: ID; logger?: ILogger; eventBus?: IEventBus }) {
    this.sessionId = options?.sessionId || generateId('voice_session');
    this.config = config;
    this.logger = options?.logger?.withContext({ sessionId: this.sessionId, service: 'VoiceSession' });
    this.eventBus = options?.eventBus;
  }

  public async start(): Promise<void> {
    this.setStatus('connecting');
    this.logger?.info(`Starting voice session '${this.sessionId}'`);
    await this.doStart();
    this.setStatus('listening');
    this.eventBus?.emit(AIOSEventTypes.VOICE_STARTED, { sessionId: this.sessionId, config: this.config }, `VoiceSession:${this.sessionId}`);
  }

  public async stop(): Promise<void> {
    this.logger?.info(`Stopping voice session '${this.sessionId}'`);
    await this.doStop();
    this.setStatus('closed');
    this.eventBus?.emit(AIOSEventTypes.VOICE_STOPPED, { sessionId: this.sessionId }, `VoiceSession:${this.sessionId}`);
  }

  public sendAudio(chunk: Uint8Array): void {
    if (this.status !== 'listening' && this.status !== 'processing') {
      this.logger?.warn(`Audio chunk received while status is ${this.status}`);
    }
    this.doSendAudio(chunk);
  }

  public onTranscript(listener: (segment: TranscriptSegment) => void): () => void {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  public onStateChange(listener: (status: VoiceSessionStatus) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  protected emitTranscript(segment: TranscriptSegment): void {
    this.eventBus?.emit(AIOSEventTypes.VOICE_TRANSCRIPTION_READY, {
      sessionId: this.sessionId,
      segment,
    }, `VoiceSession:${this.sessionId}`);
    
    for (const listener of this.transcriptListeners) {
      try {
        listener(segment);
      } catch (err) {
        this.logger?.error('Error executing transcript listener', undefined, err instanceof Error ? err : undefined);
      }
    }
  }

  protected setStatus(newStatus: VoiceSessionStatus): void {
    if (this.status === newStatus) return;
    this.status = newStatus;
    for (const listener of this.stateListeners) {
      try {
        listener(newStatus);
      } catch (err) {
        this.logger?.error('Error executing state listener', undefined, err instanceof Error ? err : undefined);
      }
    }
  }

  protected abstract doStart(): Promise<void>;
  protected abstract doStop(): Promise<void>;
  protected abstract doSendAudio(chunk: Uint8Array): void;
}
