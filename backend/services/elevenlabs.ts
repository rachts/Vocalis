import { config } from "../config";

export async function fetchTTSAudio(text: string): Promise<ArrayBuffer> {
  if (!config.apiKeys.elevenLabs) {
    throw new Error("Missing ElevenLabs API key");
  }

  const voiceId = config.settings.elevenLabsVoiceId;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': config.apiKeys.elevenLabs,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  return await response.arrayBuffer();
}
