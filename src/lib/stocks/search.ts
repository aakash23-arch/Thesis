import { db } from '@/lib/db';
import type { StockSummary } from './types';

export const SEARCH_RESULT_LIMIT = 8;

/**
 * Rank buckets, best first. Someone typing "INF" almost certainly wants INFY,
 * so a ticker prefix has to outrank a company-name substring -- otherwise the
 * obvious answer isn't first.
 */
const enum Rank {
  ExactTicker = 0,
  TickerPrefix = 1,
  CompanyPrefix = 2,
  CompanyWordPrefix = 3,
  Substring = 4,
  NoMatch = 5,
}

function rank(stock: StockSummary, query: string): Rank {
  const ticker = stock.ticker.toLowerCase();
  const company = stock.company.toLowerCase();

  if (ticker === query) return Rank.ExactTicker;
  if (ticker.startsWith(query)) return Rank.TickerPrefix;
  if (company.startsWith(query)) return Rank.CompanyPrefix;
  // "motors" should find Tata Motors, not just names beginning with it.
  if (company.split(/[\s&.-]+/).some((word) => word.startsWith(query))) {
    return Rank.CompanyWordPrefix;
  }
  if (ticker.includes(query) || company.includes(query)) return Rank.Substring;
  return Rank.NoMatch;
}

/**
 * Orders and trims candidates. Kept pure and separate from the query so the
 * ranking rules stay unit-testable without a database.
 */
export function rankStocks(
  candidates: StockSummary[],
  query: string,
  limit: number = SEARCH_RESULT_LIMIT,
): StockSummary[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return [];

  return candidates
    .map((stock) => ({ stock, rank: rank(stock, normalized) }))
    .filter((entry) => entry.rank !== Rank.NoMatch)
    .sort((a, b) => a.rank - b.rank || a.stock.ticker.localeCompare(b.stock.ticker))
    .slice(0, limit)
    .map((entry) => entry.stock);
}

/**
 * THE SEAM, now backed by Postgres.
 *
 * The database does the coarse filtering (anything containing the query) and
 * `rankStocks` does the ordering, because expressing "ticker prefix beats
 * company substring" in SQL would be both uglier and untestable.
 *
 * Server-only: it touches Prisma. Client callers go through
 * `/api/stocks/search`.
 */
export async function searchStocks(
  query: string,
  limit: number = SEARCH_RESULT_LIMIT,
): Promise<StockSummary[]> {
  const normalized = query.trim();
  if (normalized === '') return [];

  const rows = await db.stock.findMany({
    where: {
      OR: [
        { ticker: { contains: normalized, mode: 'insensitive' } },
        { company: { contains: normalized, mode: 'insensitive' } },
      ],
    },
    select: { ticker: true, company: true, exchange: true, sector: true, lastPrice: true },
    // Generous cap: rank across a wide candidate set, then trim to `limit`.
    take: 50,
  });

  return rankStocks(
    rows.map((r) => ({
      ticker: r.ticker,
      company: r.company,
      exchange: r.exchange as 'NSE' | 'BSE',
      sector: r.sector ?? '',
      lastPrice: r.lastPrice === null ? null : Number(r.lastPrice),
    })),
    normalized,
    limit,
  );
}

/** Exact lookup, for validating a submitted ticker server-side. */
export async function findStock(
  ticker: string,
  exchange?: StockSummary['exchange'],
): Promise<StockSummary | null> {
  const normalized = ticker.trim().toUpperCase();
  if (normalized === '') return null;

  const row = await db.stock.findFirst({
    where: { ticker: normalized, ...(exchange ? { exchange } : {}) },
    select: { ticker: true, company: true, exchange: true, sector: true, lastPrice: true },
  });

  if (!row) return null;

  return {
    ticker: row.ticker,
    company: row.company,
    exchange: row.exchange as 'NSE' | 'BSE',
    sector: row.sector ?? '',
    lastPrice: row.lastPrice === null ? null : Number(row.lastPrice),
  };
}
