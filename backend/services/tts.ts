import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function synthesizeSpeech(text: string, voiceId = "Rachel"): Promise<Buffer> {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  const actualVoiceId = process.env.ELEVENLABS_VOICE_ID || voiceId || "Rachel"; // Use env if set

  const audioStream = await client.textToSpeech.convert(actualVoiceId, {
    text,
    model_id: "eleven_turbo_v2",
    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
  });
  
  const chunks: any[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}
