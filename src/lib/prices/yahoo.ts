import type { PriceProvider, Quote, QuoteBatch, QuoteFailure } from './types';

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const TIMEOUT_MS = 8000;
/** Yahoo is unofficial and rate-limits. Small batches with a pause between. */
const BATCH_SIZE = 5;
const BATCH_PAUSE_MS = 250;

/** NSE tickers are suffixed .NS on Yahoo, BSE .BO. */
export function yahooSymbol(ticker: string, exchange: 'NSE' | 'BSE'): string {
  return `${ticker}.${exchange === 'NSE' ? 'NS' : 'BO'}`;
}

/**
 * Pulls a quote out of Yahoo's chart payload.
 *
 * Exported and kept pure so it can be tested against captured fixtures --
 * including malformed ones. This is an undocumented endpoint that can change
 * shape without warning, and the mapper is where that would first bite.
 */
export function parseChartResponse(
  body: unknown,
  ticker: string,
  exchange: 'NSE' | 'BSE',
): Quote | { error: string } {
  const chart = (body as { chart?: { result?: unknown[]; error?: { description?: string } } })
    ?.chart;

  if (chart?.error) {
    return { error: chart.error.description ?? 'provider reported an error' };
  }

  const meta = (chart?.result?.[0] as { meta?: Record<string, unknown> } | undefined)?.meta;
  if (!meta) return { error: 'no result in payload' };

  const price = meta.regularMarketPrice;
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return { error: 'missing regularMarketPrice' };
  }

  const prev = meta.chartPreviousClose ?? meta.previousClose;
  const seconds = meta.regularMarketTime;

  return {
    ticker,
    exchange,
    price,
    previousClose: typeof prev === 'number' && Number.isFinite(prev) ? prev : null,
    // Yahoo reports epoch seconds. Fall back to now only when it is absent, so
    // a stale quote is never silently labelled fresh.
    asOf: typeof seconds === 'number' ? new Date(seconds * 1000) : new Date(),
  };
}

async function fetchOne(ticker: string, exchange: 'NSE' | 'BSE'): Promise<Quote | QuoteFailure> {
  const symbol = yahooSymbol(ticker, exchange);
  try {
    const response = await fetch(`${BASE}/${encodeURIComponent(symbol)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        // Yahoo serves a challenge page to clients without a browser UA.
        'User-Agent': 'Mozilla/5.0 (compatible; Thesis/1.0)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { ticker, reason: `HTTP ${response.status}` };
    }

    const parsed = parseChartResponse(await response.json(), ticker, exchange);
    return 'error' in parsed ? { ticker, reason: parsed.error } : parsed;
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.name === 'TimeoutError'
          ? `timed out after ${TIMEOUT_MS}ms`
          : error.message
        : 'unknown error';
    return { ticker, reason };
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const yahooProvider: PriceProvider = {
  name: 'yahoo',

  async fetchQuotes(tickers): Promise<QuoteBatch> {
    const quotes: Quote[] = [];
    const failures: QuoteFailure[] = [];

    for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
      const batch = tickers.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map((t) => fetchOne(t.ticker, t.exchange)));

      for (const result of results) {
        if ('price' in result) quotes.push(result);
        else failures.push(result);
      }

      if (i + BATCH_SIZE < tickers.length) await sleep(BATCH_PAUSE_MS);
    }

    return { quotes, failures };
  },
};
