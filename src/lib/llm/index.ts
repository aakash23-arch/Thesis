import { geminiProvider } from './gemini';
import type { LlmProvider } from './types';

/**
 * The active model provider.
 *
 * Gemini through Phase 2 per the project's zero-investment defaults. Session 14
 * introduces Claude for DRHP extraction, where financial-figure accuracy earns
 * usage-based spend -- as a second adapter, not a rewrite.
 */
export const llmProvider: LlmProvider = geminiProvider;

/** Whether generation is available. The UI explains itself rather than failing. */
export const isLlmConfigured = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export type { GenerationRequest, LlmProvider } from './types';
