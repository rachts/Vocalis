import type { ID } from '../types/common';
import type { AudioFormat, AudioStream, TranscriptSegment, VoiceSessionStatus, VoiceSessionConfig } from './voice-types';

/**
 * Clean architectural boundaries for Speech To Text, Text To Speech, Activity Detection, and Dialog Sessions.
 * Designed to decouple active application logic from vendor implementations (Deepgram, WebRTC, VAD).
 */

export interface ISpeechToTextProvider {
  readonly name: string;
  startStream(config: { format: AudioFormat }): Promise<AudioStream>;
  transcribeStream(audio: AudioStream): Promise<AsyncIterable<TranscriptSegment>>;
  transcribeBuffer(buffer: Uint8Array, format: AudioFormat): Promise<TranscriptSegment[]>;
  isHealthy(): Promise<boolean>;
}

export interface ITextToSpeechProvider {
  readonly name: string;
  synthesize(text: string, voiceId?: string): Promise<Uint8Array>;
  synthesizeStream(text: string, voiceId?: string): Promise<AudioStream>;
  listVoices(): Promise<Array<{ id: string; name: string; language: string }>>;
  isHealthy(): Promise<boolean>;
}

export interface IVoiceActivityDetector {
  start(audio: AudioStream): Promise<void>;
  onSpeechStart(listener: () => void): () => void;
  onSpeechEnd(listener: () => void): () => void;
  stop(): Promise<void>;
}

export interface IVoiceSession {
  readonly sessionId: ID;
  readonly status: VoiceSessionStatus;
  
  start(): Promise<void>;
  stop(): Promise<void>;
  sendAudio(chunk: Uint8Array): void;
  
  onTranscript(listener: (segment: TranscriptSegment) => void): () => void;
  onStateChange(listener: (status: VoiceSessionStatus) => void): () => void;
}
