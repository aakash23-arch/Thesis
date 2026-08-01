import { NIFTY_50 } from './nifty50';
import type { StockSummary } from './types';

export const SEARCH_RESULT_LIMIT = 8;

/**
 * Rank buckets, best first. Someone typing "INF" almost certainly wants INFY,
 * so a ticker prefix has to outrank a company-name substring -- otherwise
 * "Infosys" and "Bharti Airtel" (which contains "irt"... ) compete on equal
 * footing and the obvious answer isn't first.
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
 * THE SEAM. Every caller -- onboarding, the add-position flow, the portfolio
 * page -- goes through this function. Today it filters a static Nifty 50 list;
 * in Session 3 its body becomes a Postgres query against the seeded `stocks`
 * table and nothing above it changes.
 *
 * Async from the start for exactly that reason: callers already await it, so
 * swapping the source needs no change at the call sites.
 */
export async function searchStocks(
  query: string,
  limit: number = SEARCH_RESULT_LIMIT,
): Promise<StockSummary[]> {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return [];

  return NIFTY_50.map((stock) => ({ stock, rank: rank(stock, normalized) }))
    .filter((entry) => entry.rank !== Rank.NoMatch)
    .sort((a, b) => a.rank - b.rank || a.stock.ticker.localeCompare(b.stock.ticker))
    .slice(0, limit)
    .map((entry) => entry.stock);
}

/** Exact lookup for validating a submitted ticker server-side. */
export async function findStock(
  ticker: string,
  exchange?: StockSummary['exchange'],
): Promise<StockSummary | null> {
  const normalized = ticker.trim().toUpperCase();
  return (
    NIFTY_50.find(
      (stock) =>
        stock.ticker === normalized && (exchange === undefined || stock.exchange === exchange),
    ) ?? null
  );
}
