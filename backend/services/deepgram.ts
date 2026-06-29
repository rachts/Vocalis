import { config } from "../config";

export function getDeepgramConfig() {
  if (!config.apiKeys.deepgram) {
    throw new Error("Missing Deepgram API key");
  }

  const url = 'wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&interim_results=true';
  
  return {
    url,
    headers: {
      Authorization: `Token ${config.apiKeys.deepgram}`
    }
  };
}
