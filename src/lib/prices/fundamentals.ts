import YahooFinance from 'yahoo-finance2';
import { db } from '@/lib/db';
import type { MetricKey } from '@/lib/metrics';
import { yahooSymbol } from './yahoo';

/** Every metric is optional -- Yahoo reports different fields per company. */
export type FundamentalsSnapshot = Partial<Record<MetricKey, number>>;

export interface FundamentalsResult {
  ticker: string;
  metrics: FundamentalsSnapshot;
}

export interface FundamentalsSummary {
  requested: number;
  updated: number;
  failed: { ticker: string; reason: string }[];
}

/**
 * `quoteSummary` is behind a cookie+crumb handshake that Yahoo actively
 * tightens -- a plain fetch gets 401 "Invalid Crumb". yahoo-finance2 maintains
 * that handshake, so we use it here rather than hand-rolling a bypass. The
 * price path still uses a plain fetch, because the chart endpoint needs none
 * of this.
 */
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const MODULES = ['defaultKeyStatistics', 'financialData', 'summaryDetail'] as const;

/** Yahoo returns fractions for rates; the registry stores percentages. */
function toPercent(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value * 100 : undefined;
}

function toRatio(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Pure mapper from a quoteSummary payload to our metric vocabulary.
 *
 * Exported and separately tested: this is an undocumented shape, and a silent
 * change here would put wrong numbers under someone's investment thesis.
 */
export function mapFundamentals(payload: unknown): FundamentalsSnapshot {
  const p = (payload ?? {}) as Record<string, Record<string, unknown> | undefined>;
  const stats = p.defaultKeyStatistics ?? {};
  const financial = p.financialData ?? {};
  const summary = p.summaryDetail ?? {};

  const snapshot: FundamentalsSnapshot = {
    trailing_pe: toRatio(summary.trailingPE),
    price_to_book: toRatio(stats.priceToBook),
    revenue_growth_yoy: toPercent(financial.revenueGrowth),
    profit_margin: toPercent(financial.profitMargins),
    return_on_equity: toPercent(financial.returnOnEquity),
    // Yahoo reports debt/equity as a percentage, always -- verified against
    // companies whose real leverage is known: Reliance 36.65, TCS 10.21,
    // Infosys 9.54, BEL 0.27. Read as ratios those would say Infosys carries
    // nine times its equity in debt, which is nonsense; as percentages they
    // match reality. So: divide by 100, unconditionally.
    debt_to_equity: (() => {
      const raw = toRatio(financial.debtToEquity);
      return raw === undefined ? undefined : raw / 100;
    })(),
    dividend_yield: toPercent(summary.dividendYield),
  };

  // Drop absent keys so "not reported" and "reported as zero" stay distinct.
  for (const key of Object.keys(snapshot) as MetricKey[]) {
    if (snapshot[key] === undefined) delete snapshot[key];
  }
  return snapshot;
}

async function fetchOne(
  ticker: string,
  exchange: 'NSE' | 'BSE',
): Promise<FundamentalsResult | { ticker: string; reason: string }> {
  try {
    const payload = await yf.quoteSummary(yahooSymbol(ticker, exchange), {
      modules: [...MODULES],
    });
    const metrics = mapFundamentals(payload);
    if (Object.keys(metrics).length === 0) {
      return { ticker, reason: 'no metrics reported' };
    }
    return { ticker, metrics };
  } catch (error) {
    return {
      ticker,
      reason:
        error instanceof Error ? error.message.split('\n')[0]!.slice(0, 120) : 'unknown error',
    };
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Refreshes fundamentals for the universe. Same contract as `refreshPrices`:
 * partial failure is data, not an exception.
 */
export async function refreshFundamentals(tickers?: string[]): Promise<FundamentalsSummary> {
  const stocks = await db.stock.findMany({
    where: tickers?.length ? { ticker: { in: tickers } } : undefined,
    select: { id: true, ticker: true, exchange: true },
  });

  const failed: { ticker: string; reason: string }[] = [];
  let updated = 0;
  const fetchedAt = new Date();

  // Sequential: quoteSummary rate-limits harder than the chart endpoint, and
  // the pooled connection runs at connection_limit=1 anyway.
  for (const stock of stocks) {
    const result = await fetchOne(stock.ticker, stock.exchange as 'NSE' | 'BSE');

    if ('reason' in result) {
      failed.push(result);
      continue;
    }

    const data = {
      trailingPe: result.metrics.trailing_pe ?? null,
      priceToBook: result.metrics.price_to_book ?? null,
      revenueGrowthYoy: result.metrics.revenue_growth_yoy ?? null,
      profitMargin: result.metrics.profit_margin ?? null,
      returnOnEquity: result.metrics.return_on_equity ?? null,
      debtToEquity: result.metrics.debt_to_equity ?? null,
      dividendYield: result.metrics.dividend_yield ?? null,
      fetchedAt,
    };

    try {
      await db.stockFundamentals.upsert({
        where: { stockId: stock.id },
        create: { stockId: stock.id, ...data },
        update: data,
      });
      updated += 1;
    } catch (error) {
      failed.push({
        ticker: stock.ticker,
        reason: `write failed: ${error instanceof Error ? error.message.split('\n')[0] : 'unknown'}`,
      });
    }

    await sleep(120);
  }

  return { requested: stocks.length, updated, failed };
}
