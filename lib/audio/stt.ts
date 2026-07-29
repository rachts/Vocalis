export class STT {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private onResult: (text: string) => void;
  private isBrowserFallback = false;
  private recognition: any = null;

  constructor(onResult: (text: string) => void) {
    this.onResult = onResult;
  }

  async start() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/stt-available`);
      if (!res.ok) throw new Error('Cloud STT unavailable');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        try {
          const transcribeRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/transcribe`, {
            method: 'POST', body: formData
          });
          const { text } = await transcribeRes.json();
          if (text) this.onResult(text);
        } catch (e) {
          console.error('STT backend error:', e);
        }
      };

      this.mediaRecorder.start(250);
      this.isBrowserFallback = false;
    } catch (e) {
      console.log('Falling back to Web Speech API');
      this.isBrowserFallback = true;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          this.onResult(text);
        };
        this.recognition.start();
      }
    }
  }

  stop() {
    if (this.isBrowserFallback && this.recognition) {
      this.recognition.stop();
    } else if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
  }
}
