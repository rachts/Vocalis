export async function synthesizeSpeech(text: string, voiceId = "Rachel"): Promise<Buffer> {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not set");

  const actualVoiceId = process.env.ELEVENLABS_VOICE_ID || voiceId || "Rachel";
  
  // Example voice id for Rachel if missing
  const vId = actualVoiceId === "Rachel" ? "21m00Tcm4TlvDq8ikWAM" : actualVoiceId;
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    })
  });
  
  if (!response.ok) throw new Error(`ElevenLabs API error: ${response.statusText}`);
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
