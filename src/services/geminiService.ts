import { GoogleGenAI, Type } from '@google/genai';
import { DecisionResult } from '../types';

/* ==================================================================
   TASK 4 — GEMINI AI (enhancement layer only)

   Architecture:
     Balanced Buyte Decision Engine  →  Best Buyte / Sip / Score / Confidence
     →  Gemini  →  friendlier explanation, coach tip, healthy swap
     →  Render

   The Decision Engine (utils/engine.ts) has ALREADY picked the
   recommendation before this file is ever called. Gemini is never
   asked to choose a food, score anything, or override the engine —
   it only rewrites the engine's own facts into warmer, plainer
   language. If the API key is missing, the call fails, or the
   response doesn't parse, this module returns null and the
   engine's rule-based text (already on screen) simply stays. That
   failure path is silent and safe — never a broken UI state.
   ================================================================== */

export interface GeminiCoachContent {
  coachRationale: string;
  coachTip: string;
  sipExplanation: string;
  healthySwap?: { original: string; replacement: string; caloricSavings: string };
}

let cachedClient: GoogleGenAI | null | undefined;

function getClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  try {
    const key = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    cachedClient = key ? new GoogleGenAI({ apiKey: key }) : null;
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    coachRationale: { type: Type.STRING, description: 'A warm, plain-language, 1-2 sentence explanation of why this food fits the goal. No medical claims, no jargon.' },
    coachTip: { type: Type.STRING, description: 'A short, encouraging coach tip for the day. Never says "guaranteed", "100% verified", or "perfect".' },
    sipExplanation: { type: Type.STRING, description: 'A 1 sentence, plain-language explanation of why the suggested drink pairs well with the food.' },
    healthySwap: {
      type: Type.OBJECT,
      properties: {
        original: { type: Type.STRING },
        replacement: { type: Type.STRING },
        caloricSavings: { type: Type.STRING },
      },
    },
  },
  required: ['coachRationale', 'coachTip', 'sipExplanation'],
};

export async function enhanceWithGemini(result: DecisionResult): Promise<GeminiCoachContent | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const prompt = `You are a friendly, encouraging food-decision coach inside the Balanced Buyte app.
Balanced Buyte already decided the recommendation below — you are NOT choosing or changing it, only
explaining it in warmer, simpler, everyday language a 12-year-old could follow in under 30 seconds.

Recommendation facts (do not change any of these):
- Food: ${result.bestBuyteName} (${result.category})
- Goal: ${result.goal}
- Meal time: ${result.mealTime}
- Balanced Score: ${result.meterScore}/100
- Decision Confidence: ${result.confidencePercentage}%
- Balanced Sip pairing: ${result.balancedSip.primary}
- Existing plain-language rationale: ${result.coachRationale}
- Existing coach tip: ${result.coachTip}

Write friendlier replacements for: coachRationale, coachTip, sipExplanation, and one optional
healthySwap. Rules:
- Keep every fact the same — do not invent nutrition numbers or change the recommendation.
- No medical claims, no diagnosis, no scientific/technical jargon (no "metabolic", "glycemic", "cellular", etc).
- Never say "100% verified", "perfect", "guaranteed", or "scientifically optimized".
- Sound like a supportive friend, not a lab report.
Respond only with the JSON object described by the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) return null;
    const parsed = JSON.parse(text.trim());
    if (!parsed || typeof parsed.coachRationale !== 'string') return null;
    return parsed as GeminiCoachContent;
  } catch (err) {
    console.warn('Gemini enhancement skipped (falling back to Decision Engine text):', err);
    return null;
  }
}
