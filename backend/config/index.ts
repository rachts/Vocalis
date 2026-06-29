import dotenv from 'dotenv';
import path from 'path';

// Ensure .env.local is loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export const config = {
  port: process.env.PORT || 3001,
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY,
    elevenLabs: process.env.ELEVENLABS_API_KEY,
    deepgram: process.env.DEEPGRAM_API_KEY,
  },
  settings: {
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel default
  },
};
