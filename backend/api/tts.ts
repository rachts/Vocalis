import { Router } from 'express';
import { ttsService } from '../services/tts.service';

export const ttsRouter = Router();

ttsRouter.post('/tts', async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioStream = await ttsService.generateSpeech(text);
    
    res.set('Content-Type', 'audio/mpeg');
    audioStream.pipe(res);
  } catch (error: any) {
    console.error("TTS error:", error);
    res.status(500).json({ error: error.message || "Failed to generate TTS" });
  }
});
