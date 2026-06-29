import { Router } from 'express';
import { fetchTTSAudio } from '../services/elevenlabs';

export const ttsRouter = Router();

ttsRouter.post('/tts', async (req, res) => {
  try {
    const text = req.body.text;
    const audioBuffer = await fetchTTSAudio(text);
    
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error: any) {
    console.error("TTS error:", error);
    res.status(500).json({ error: error.message || "Failed to generate TTS" });
  }
});
