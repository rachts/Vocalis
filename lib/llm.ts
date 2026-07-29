import { GoogleGenerativeAI } from "@google/generative-ai";
import { VOCALIS_SYSTEM_PROMPT } from "./prompts";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: VOCALIS_SYSTEM_PROMPT,
});

export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: VOCALIS_SYSTEM_PROMPT,
});
