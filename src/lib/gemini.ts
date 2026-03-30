import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI recommendations will use fallback.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';

export const AI_TIMEOUT_MS = 5000;
