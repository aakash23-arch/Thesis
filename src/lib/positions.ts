import { z } from 'zod';
import { db } from '@/lib/db';
import { findStock } from '@/lib/stocks/search';

/**
 * Shared by onboarding's first-position step and the portfolio's add form, so
 * the two can never validate differently.
 */
export const positionInputSchema = z.object({
  ticker: z.string().min(1, 'Choose a stock.'),
  exchange: z.enum(['NSE', 'BSE']),
  quantity: z.coerce.number().positive('Quantity must be more than zero.'),
  avgBuyPrice: z.coerce.number().positive('Average price must be more than zero.'),
  buyDate: z.coerce
    .date()
    .max(new Date(), 'Buy date cannot be in the future.')
    .refine((d) => d.getFullYear() >= 1990, 'Buy date looks too far in the past.'),
});

/** Editing leaves the instrument alone -- change the stock and it is a different holding. */
export const positionEditSchema = positionInputSchema.pick({
  quantity: true,
  avgBuyPrice: true,
  buyDate: true,
});

/**
 * What crosses the wire from a form: strings. Declared explicitly because
 * Zod 3's `coerce` reports its output type as its input.
 */
export interface PositionInput {
  ticker: string;
  exchange: 'NSE' | 'BSE';
  quantity: string | number;
  avgBuyPrice: string | number;
  buyDate: string | Date;
}

export type PositionEditInput = Omit<PositionInput, 'ticker' | 'exchange'>;

export interface PositionRow {
  id: string;
  ticker: string;
  exchange: string;
  company: string | null;
  sector: string | null;
  quantity: number;
  avgBuyPrice: number;
  buyDate: Date;
  /** Cost basis. */
  invested: number;
  /** Null when we have never fetched a price for this instrument. */
  lastPrice: number | null;
  previousClose: number | null;
  priceUpdatedAt: Date | null;
  /** All null when there is no price -- never a zero standing in for "unknown". */
  marketValue: number | null;
  gain: number | null;
  gainPercent: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  hasThesis: boolean;
  /** Null when there is no thesis, or none of its assumptions could be checked. */
  thesisScore: number | null;
  thesisPreviousScore: number | null;
}

/**
 * Open positions for a user, joined to their latest known price.
 *
 * Prices live on `Stock`, not `Position`, so one refresh updates every holder.
 * Derived money figures are null rather than zero when no price exists: an
 * invented number is worse than an absent one.
 */
export async function listPositions(userId: string): Promise<PositionRow[]> {
  const rows = await db.position.findMany({
    where: { userId, closedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ticker: true,
      exchange: true,
      sector: true,
      quantity: true,
      avgBuyPrice: true,
      buyDate: true,
      theses: {
        select: { healthScore: true, previousHealthScore: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (rows.length === 0) return [];

  const stocks = await db.stock.findMany({
    where: { ticker: { in: [...new Set(rows.map((r) => r.ticker))] } },
    select: {
      ticker: true,
      exchange: true,
      company: true,
      sector: true,
      lastPrice: true,
      previousClose: true,
      priceUpdatedAt: true,
    },
  });
  const stockByKey = new Map(stocks.map((s) => [`${s.ticker}:${s.exchange}`, s]));

  return rows.map((r) => {
    const stock = stockByKey.get(`${r.ticker}:${r.exchange}`);
    const quantity = Number(r.quantity);
    const avgBuyPrice = Number(r.avgBuyPrice);
    const invested = quantity * avgBuyPrice;

    const lastPrice = stock?.lastPrice == null ? null : Number(stock.lastPrice);
    const previousClose = stock?.previousClose == null ? null : Number(stock.previousClose);

    const marketValue = lastPrice === null ? null : quantity * lastPrice;
    const gain = marketValue === null ? null : marketValue - invested;

    return {
      id: r.id,
      ticker: r.ticker,
      exchange: r.exchange,
      company: stock?.company ?? null,
      sector: stock?.sector ?? r.sector,
      quantity,
      avgBuyPrice,
      buyDate: r.buyDate,
      invested,
      lastPrice,
      previousClose,
      priceUpdatedAt: stock?.priceUpdatedAt ?? null,
      marketValue,
      gain,
      gainPercent: gain === null || invested === 0 ? null : (gain / invested) * 100,
      dayChange:
        lastPrice === null || previousClose === null
          ? null
          : (lastPrice - previousClose) * quantity,
      dayChangePercent:
        lastPrice === null || previousClose === null || previousClose === 0
          ? null
          : ((lastPrice - previousClose) / previousClose) * 100,
      hasThesis: r.theses.length > 0,
      thesisScore: r.theses[0]?.healthScore ?? null,
      thesisPreviousScore: r.theses[0]?.previousHealthScore ?? null,
    };
  });
}

export interface PortfolioSummary {
  positionCount: number;
  investedTotal: number;
  /** Null unless every position has a price -- a partial total would understate. */
  marketValueTotal: number | null;
  gainTotal: number | null;
  gainPercent: number | null;
  dayChangeTotal: number | null;
  dayChangePercent: number | null;
  withThesis: number;
  /** Oldest price in the set: how stale the totals are, at worst. */
  pricedAsOf: Date | null;
  /** True once the oldest price is more than a day old. */
  pricesStale: boolean;
  unpricedCount: number;
}

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/** `now` is injectable so staleness can be tested without freezing the clock. */
export function summarise(positions: PositionRow[], now: Date = new Date()): PortfolioSummary {
  const investedTotal = positions.reduce((sum, p) => sum + p.invested, 0);
  const unpriced = positions.filter((p) => p.marketValue === null);
  const allPriced = positions.length > 0 && unpriced.length === 0;

  const marketValueTotal = allPriced
    ? positions.reduce((sum, p) => sum + (p.marketValue ?? 0), 0)
    : null;
  const gainTotal = marketValueTotal === null ? null : marketValueTotal - investedTotal;

  const dates = positions
    .map((p) => p.priceUpdatedAt)
    .filter((d): d is Date => d instanceof Date)
    .map((d) => d.getTime());

  const dayChangeTotal = allPriced
    ? positions.reduce((sum, p) => sum + (p.dayChange ?? 0), 0)
    : null;
  // Measured against yesterday's close, which is today's value minus today's move.
  const previousValue =
    marketValueTotal === null || dayChangeTotal === null ? null : marketValueTotal - dayChangeTotal;

  return {
    positionCount: positions.length,
    investedTotal,
    marketValueTotal,
    gainTotal,
    gainPercent:
      gainTotal === null || investedTotal === 0 ? null : (gainTotal / investedTotal) * 100,
    dayChangeTotal,
    dayChangePercent:
      dayChangeTotal === null || previousValue === null || previousValue === 0
        ? null
        : (dayChangeTotal / previousValue) * 100,
    withThesis: positions.filter((p) => p.hasThesis).length,
    pricedAsOf: dates.length ? new Date(Math.min(...dates)) : null,
    pricesStale: dates.length ? now.getTime() - Math.min(...dates) > STALE_AFTER_MS : false,
    unpricedCount: unpriced.length,
  };
}

export interface SectorSlice {
  sector: string;
  value: number;
  percent: number;
}

/** Exposure by sector, on market value where known and cost basis otherwise. */
export function sectorBreakdown(positions: PositionRow[]): SectorSlice[] {
  const totals = new Map<string, number>();

  for (const p of positions) {
    const sector = p.sector ?? 'Unclassified';
    totals.set(sector, (totals.get(sector) ?? 0) + (p.marketValue ?? p.invested));
  }

  const grand = [...totals.values()].reduce((a, b) => a + b, 0);
  if (grand === 0) return [];

  return [...totals.entries()]
    .map(([sector, value]) => ({ sector, value, percent: (value / grand) * 100 }))
    .sort((a, b) => b.value - a.value);
}

// ---------- Mutations. Every one is scoped by userId. ----------

export async function createPosition(userId: string, input: PositionInput): Promise<void> {
  const parsed = positionInputSchema.parse(input);

  // Resolve the instrument server-side so sector and exchange are ours, not
  // whatever the client posted.
  const stock = await findStock(parsed.ticker, parsed.exchange);
  if (!stock) throw new Error(`Unknown ticker: ${parsed.ticker}`);

  await db.position.create({
    data: {
      userId,
      ticker: stock.ticker,
      exchange: stock.exchange,
      assetType: 'STOCK',
      quantity: parsed.quantity,
      avgBuyPrice: parsed.avgBuyPrice,
      buyDate: parsed.buyDate,
      sector: stock.sector,
    },
  });
}

export async function updatePosition(
  userId: string,
  positionId: string,
  input: PositionEditInput,
): Promise<void> {
  const parsed = positionEditSchema.parse(input);

  // updateMany, not update: it takes a where clause covering userId, so a
  // request for someone else's position matches nothing instead of editing it.
  const result = await db.position.updateMany({
    where: { id: positionId, userId },
    data: {
      quantity: parsed.quantity,
      avgBuyPrice: parsed.avgBuyPrice,
      buyDate: parsed.buyDate,
    },
  });

  if (result.count === 0) throw new Error('Position not found.');
}

/**
 * Archives rather than deletes. The thesis and the decision log survive --
 * they are the record of how someone actually thought, and Track B DQS scores
 * them later. Nothing is destroyed because a user tidied their portfolio.
 */
export async function archivePosition(userId: string, positionId: string): Promise<void> {
  const result = await db.position.updateMany({
    where: { id: positionId, userId, closedAt: null },
    data: { closedAt: new Date() },
  });

  if (result.count === 0) throw new Error('Position not found.');
}
