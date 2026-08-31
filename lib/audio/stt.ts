// Paste this as the new implementation of the STT module.
// Preserve all existing exported function/type names exactly.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Cache OmniVoice availability for 30s to avoid hammering /status on every call
let omniVoiceCache: { available: boolean; checkedAt: number } | null = null;

async function checkOmniVoice(): Promise<boolean> {
  const now = Date.now();
  if (omniVoiceCache && now - omniVoiceCache.checkedAt < 30_000) {
    return omniVoiceCache.available;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/omnivoice/status`);
    const data = await res.json() as { available: boolean };
    omniVoiceCache = { available: data.available, checkedAt: now };
    return data.available;
  } catch {
    omniVoiceCache = { available: false, checkedAt: now };
    return false;
  }
}

// ── OmniVoice path: MediaRecorder + silence detection ────────────────────────

async function transcribeWithOmniVoice(
  onTranscript: (text: string) => void,
  onError: (err: string) => void
): Promise<() => void> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    onError('Microphone access denied');
    return () => {};
  }

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  let silenceTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (silenceTimer) clearTimeout(silenceTimer);
    if (rafId) cancelAnimationFrame(rafId);
    if (recorder.state !== 'inactive') recorder.stop();
  };

  recorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    audioCtx.close();
    if (chunks.length === 0) return;

    const blob = new Blob(chunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'audio.webm');

    try {
      const res = await fetch(`${BACKEND_URL}/api/omnivoice/transcribe`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json() as { transcript?: string; error?: string };
      if (data.transcript) {
        onTranscript(data.transcript);
      } else {
        onError(data.error || 'Empty transcript');
      }
    } catch {
      onError('Transcription request failed');
    }
  };

  recorder.start(100); // collect chunks every 100ms

  // Silence detection: stop after 1.5s below threshold
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  const detectSilence = () => {
    if (stopped) return;
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    if (avg < 8) {
      if (!silenceTimer) {
        silenceTimer = setTimeout(stop, 1500);
      }
    } else {
      if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
    }
    rafId = requestAnimationFrame(detectSilence);
  };
  detectSilence();

  // Hard cap: auto-stop after 30s to prevent infinite recording
  const hardStop = setTimeout(stop, 30_000);
  recorder.addEventListener('stop', () => clearTimeout(hardStop));

  return stop;
}

// ── Web Speech API fallback ───────────────────────────────────────────────────

function transcribeWithWebSpeech(
  onTranscript: (text: string) => void,
  onError: (err: string) => void
): () => void {
  const Win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  const SR = Win.SpeechRecognition || Win.webkitSpeechRecognition;
  if (!SR) {
    onError('Speech recognition not supported in this browser');
    return () => {};
  }

  const recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onresult = (e: SpeechRecognitionEvent) => {
    const transcript = e.results[0]?.[0]?.transcript?.trim();
    if (transcript) onTranscript(transcript);
  };
  recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      onError(e.error);
    }
  };

  recognition.start();
  return () => { try { recognition.stop(); } catch {} };
}

// ── Public API ────────────────────────────────────────────────────────────────
// This is the function the rest of the app calls. Signature must match original.

export async function startListening(
  onTranscript: (text: string) => void,
  onError: (err: string) => void
): Promise<() => void> {
  if (typeof window === 'undefined') return () => {};

  const available = await checkOmniVoice();
  if (available) {
    return transcribeWithOmniVoice(onTranscript, onError);
  }
  return transcribeWithWebSpeech(onTranscript, onError);
}

// Export any other functions/types the original file exported.
// Read the original file and re-export anything that's imported elsewhere.

export class STT {
  private stopFn: (() => void) | null = null;
  private onResult: (text: string) => void;
  private onError?: (err: string) => void;

  constructor(onResult: (text: string) => void, onError?: (err: string) => void) {
    this.onResult = onResult;
    this.onError = onError;
  }
  async start() {
    this.stopFn = await startListening(this.onResult, (err) => {
      console.error(err);
      if (this.onError) this.onError(err);
    });
  }
  stop() {
    if (this.stopFn) {
      this.stopFn();
      this.stopFn = null;
    }
  }
}
