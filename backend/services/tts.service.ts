import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { config } from "../config";
import { Logger } from "../utils/logger";
import { Readable } from "stream";

class TTSService {
  private client: ElevenLabsClient;

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: config.apiKeys.elevenLabs,
    });
  }

  async generateSpeech(text: string): Promise<Readable> {console.log(config.apiKeys.elevenLabs);
    if (!text || text.trim() === "") {
      throw new Error("Text is required for TTS generation.");
    }
    
    if (!config.apiKeys.elevenLabs) {
        throw new Error("Missing ElevenLabs API key in configuration.");
    }

    try {
      Logger.info(`[TTSService] Generating speech for text: "${text.substring(0, 30)}..."`);
      const stream = await this.client.textToSpeech.stream(
        config.settings.elevenLabsVoiceId,
        {
          text,
          model_id: config.settings.elevenLabsModelId,
          voice_settings: {
            stability: config.settings.elevenLabsStability,
            similarity_boost: config.settings.elevenLabsSimilarityBoost,
            style: config.settings.elevenLabsStyle,
            use_speaker_boost: config.settings.elevenLabsSpeakerBoost,
          },
        } as any
      );
      
      // The SDK returns a Node Readable stream directly in Node.js.
      return stream as any as Readable;
    } catch (error: any) {
      Logger.error(`[TTSService] Failed to generate speech: ${error.message}`, error);
      throw error;
    }
  }
}

export const ttsService = new TTSService();