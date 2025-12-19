// src/lib/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 🔒 Locked, current models
export const PRIMARY_MODEL = "gemini-2.5-pro";
export const FALLBACK_MODEL = "gemini-2.5-flash";

// Factory function (NOT a global instance)
export function getGeminiModel(modelName: string = PRIMARY_MODEL) {
  return genAI.getGenerativeModel({ model: modelName });
}
