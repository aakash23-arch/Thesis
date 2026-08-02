import type { GenerationRequest, LlmProvider } from './types';

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 20_000;

/**
 * Gemini, per the project's zero-investment defaults: free tier, no card, and
 * enough daily requests to cover real usage through Phase 2. Claude arrives in
 * Session 14 for DRHP parsing as a second adapter behind this same interface --
 * that is why the interface exists now, with only one implementation.
 */
export const geminiProvider: LlmProvider = {
  name: 'gemini',
  model: MODEL,

  async generate({ system, prompt, temperature = 0.3 }: GenerationRequest): Promise<string> {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set.');

    const response = await fetch(`${ENDPOINT}/${MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          // Ask for JSON at the API level rather than hoping the prose complies.
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Gemini returned ${response.status}: ${detail.slice(0, 200)}`);
    }

    const body = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned no content.');
    return text;
  },
};
