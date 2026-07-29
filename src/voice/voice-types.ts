import type { ID, Timestamp, Metadata } from '../types/common';

/**
 * Foundational domain structures for Speech To Text, Text To Speech, and WebRTC Voice interactions.
 */

export interface AudioFormat {
  encoding: 'linear16' | 'opus' | 'webm' | 'mulaw' | string;
  sampleRateHz: number;
  channels: number;
}

export interface AudioStream {
  id: ID;
  format: AudioFormat;
  onData(listener: (chunk: Uint8Array) => void): () => void;
  onError(listener: (error: Error) => void): () => void;
  close(): Promise<void> | void;
}

export interface TranscriptSegment {
  id: ID;
  text: string;
  timestamp: Timestamp;
  isFinal: boolean;
  confidence?: number;
  speakerId?: string;
  metadata?: Metadata;
}

export type VoiceSessionStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'closed' | 'error';

export interface VoiceSessionConfig {
  sttProvider?: string;
  ttsProvider?: string;
  sampleRateHz?: number;
  autoStopListening?: boolean;
  metadata?: Metadata;
}
