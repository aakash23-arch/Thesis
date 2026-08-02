import { db } from '@/lib/db';
import { fetchQuotes } from './index';

export interface RefreshSummary {
  requested: number;
  updated: number;
  failed: { ticker: string; reason: string }[];
  provider: string;
}

/**
 * Refreshes the stored price for every stock in the universe.
 *
 * Deliberately does not throw on partial failure: a scheduled job that dies on
 * one bad ticker leaves the other forty-nine stale, which is worse. Callers get
 * a summary and decide what to do about it.
 */
export async function refreshPrices(tickers?: string[]): Promise<RefreshSummary> {
  const stocks = await db.stock.findMany({
    where: tickers?.length ? { ticker: { in: tickers } } : undefined,
    select: { id: true, ticker: true, exchange: true },
  });

  const { quotes, failures } = await fetchQuotes(
    stocks.map((s) => ({ ticker: s.ticker, exchange: s.exchange as 'NSE' | 'BSE' })),
  );

  const idByKey = new Map(stocks.map((s) => [`${s.ticker}:${s.exchange}`, s.id]));
  const writeFailures: { ticker: string; reason: string }[] = [];
  let updated = 0;

  // Sequential, not Promise.all. The pooled connection string runs with
  // `connection_limit=1` (pgbouncer transaction mode), so firing fifty writes
  // at once exhausts the pool rather than going faster. Each write is also
  // independent -- one bad row must not roll back prices that fetched fine.
  for (const q of quotes) {
    const id = idByKey.get(`${q.ticker}:${q.exchange}`);
    if (!id) continue;

    try {
      await db.stock.update({
        where: { id },
        data: {
          lastPrice: q.price,
          previousClose: q.previousClose,
          priceUpdatedAt: q.asOf,
        },
      });
      updated += 1;
    } catch (error) {
      writeFailures.push({
        ticker: q.ticker,
        reason: `write failed: ${error instanceof Error ? error.message.split('\n')[0] : 'unknown'}`,
      });
    }
  }

  return {
    requested: stocks.length,
    updated,
    failed: [...failures.map((f) => ({ ticker: f.ticker, reason: f.reason })), ...writeFailures],
    provider: 'yahoo',
  };
}
