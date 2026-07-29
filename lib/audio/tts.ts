export class TTS {
  private audioContext: AudioContext | null = null;
  private isBrowserFallback = false;

  async speak(text: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/tts-available`);
      if (!res.ok) throw new Error('Cloud TTS unavailable');

      const synthRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const arrayBuffer = await synthRes.arrayBuffer();
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
      
      return new Promise((resolve) => {
        source.onended = resolve;
      });
    } catch (e) {
      console.log('Falling back to SpeechSynthesis', e);
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = resolve;
        window.speechSynthesis.speak(utterance);
      });
    }
  }

  stop() {
    if (this.audioContext) this.audioContext.close();
    window.speechSynthesis.cancel();
  }
}
