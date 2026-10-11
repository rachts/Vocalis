import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const apiKey =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
export const geminiPro = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
export { SchemaType };
