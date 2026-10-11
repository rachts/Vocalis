// backend/services/omnivoice.ts
// Handles all communication with the local OmniVoice Studio backend.
// OmniVoice runs at localhost:3900 and exposes an OpenAI-compatible API.

const OMNIVOICE_URL = process.env.OMNIVOICE_URL || 'http://localhost:3900';
const TIMEOUT_MS = 5000;

/**
 * Check if OmniVoice is running and reachable.
 */
export async function isOmniVoiceAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${OMNIVOICE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Transcribe an audio buffer using OmniVoice's Whisper-based ASR.
 * Calls: POST /v1/audio/transcriptions (OpenAI-compatible)
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType = 'audio/webm'
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', 'whisper-1'); // OmniVoice maps this to its active ASR engine
  formData.append('response_format', 'json');

  const res = await fetch(`${OMNIVOICE_URL}/v1/audio/transcriptions`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OmniVoice STT failed: ${res.status} ${text}`);
  }

  const data = await res.json() as { text: string };
  return data.text?.trim() || '';
}

/**
 * Synthesize speech using OmniVoice's local TTS engine.
 * Calls: POST /v1/audio/speech (OpenAI-compatible)
 * Returns raw audio buffer (mp3).
 */
export async function synthesizeSpeech(
  text: string,
  voice = 'default'
): Promise<Buffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${OMNIVOICE_URL}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tts-1',         // OmniVoice maps this to its active TTS engine
        input: text,
        voice,                  // 'default' or a cloned profile ID from /v1/audio/voices
        response_format: 'mp3',
        speed: 1.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OmniVoice TTS failed: ${res.status} ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * List available voices from OmniVoice (includes cloned profiles).
 * Calls: GET /v1/audio/voices
 */
export async function listVoices(): Promise<Array<{ voice_id: string; name: string; type: string }>> {
  const res = await fetch(`${OMNIVOICE_URL}/v1/audio/voices`);
  if (!res.ok) return [];
  const data = await res.json() as { voices: Array<{ voice_id: string; name: string; type: string }> };
  return data.voices || [];
}
