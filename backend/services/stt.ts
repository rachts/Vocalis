import { createClient } from "@deepgram/sdk";

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is not set");
  }
  
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    { model: "nova-2", smart_format: true, language: "en" }
  );

  if (error) {
    throw error;
  }

  return result.results.channels[0].alternatives[0].transcript;
}
