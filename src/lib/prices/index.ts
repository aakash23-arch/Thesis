import { yahooProvider } from './yahoo';
import type { PriceProvider, QuoteBatch } from './types';

/**
 * The active price provider.
 *
 * Yahoo's chart endpoint is unofficial: free and keyless, but it can rate-limit
 * or change shape. Adding the official NSE/BSE bhavcopy later means writing a
 * second adapter and swapping this constant -- no caller changes. Same seam as
 * `searchStocks` and the LLM layer.
 */
export const priceProvider: PriceProvider = yahooProvider;

export async function fetchQuotes(
  tickers: { ticker: string; exchange: 'NSE' | 'BSE' }[],
): Promise<QuoteBatch> {
  if (tickers.length === 0) return { quotes: [], failures: [] };
  return priceProvider.fetchQuotes(tickers);
}

export type { Quote, QuoteBatch, QuoteFailure, PriceProvider } from './types';
