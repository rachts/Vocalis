export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  if (!process.env.DEEPGRAM_API_KEY) throw new Error("DEEPGRAM_API_KEY is not set");
  
  const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": "audio/webm"
    },
    body: audioBuffer as unknown as BodyInit
  });
  
  if (!response.ok) throw new Error(`Deepgram API error: ${response.statusText}`);
  const data = await response.json();
  return data.results.channels[0].alternatives[0].transcript;
}
