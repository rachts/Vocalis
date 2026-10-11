// Paste this as the new implementation of the TTS module.
// Preserve all existing exported function/type names exactly.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

let currentAudio: HTMLAudioElement | null = null;

// Cache TTS availability (same pattern as STT)
let ttsCache: { available: boolean; checkedAt: number } | null = null;

async function checkOmniVoiceTTS(): Promise<boolean> {
  const now = Date.now();
  if (ttsCache && now - ttsCache.checkedAt < 30_000) return ttsCache.available;
  try {
    const res = await fetch(`${BACKEND_URL}/api/omnivoice/status`);
    const data = await res.json() as { available: boolean };
    ttsCache = { available: data.available, checkedAt: now };
    return data.available;
  } catch {
    ttsCache = { available: false, checkedAt: now };
    return false;
  }
}

// ── OmniVoice TTS path ────────────────────────────────────────────────────────

async function speakWithOmniVoice(
  text: string,
  voice: string,
  onEnd?: () => void
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${BACKEND_URL}/api/omnivoice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    await new Promise<void>((resolve, reject) => {
      currentAudio = new Audio(url);
      currentAudio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        onEnd?.();
        resolve();
      };
      currentAudio.onerror = (e) => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        onEnd?.();
        reject(e);
      };
      currentAudio.play().catch(reject);
    });
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── Browser SpeechSynthesis fallback ─────────────────────────────────────────

function speakWithBrowser(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utter);
}

// ── Public API ────────────────────────────────────────────────────────────────
// speak() and stop() must match the original file's exported signatures exactly.

export async function speak(
  text: string,
  onEnd?: () => void,
  voice = 'default'
): Promise<void> {
  if (!text?.trim()) { onEnd?.(); return; }

  // Cancel any current playback
  stopPlayback();

  const available = await checkOmniVoiceTTS();
  if (available) {
    try {
      await speakWithOmniVoice(text, voice, onEnd);
      return;
    } catch {
      // OmniVoice failed mid-request — fall through to browser
    }
  }

  speakWithBrowser(text, onEnd);
}

export function stopPlayback(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (typeof window !== 'undefined') {
    window.speechSynthesis?.cancel();
  }
}

// Re-export anything else the original file exported.
// Read the original and add aliases here as needed.
export class TTS {
  async speak(text: string) {
    return new Promise<void>((resolve) => {
      speak(text, () => resolve());
    });
  }
  stop() {
    stopPlayback();
  }
}
