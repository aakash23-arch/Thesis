import { describe, expect, it } from 'vitest';
import { sectorBreakdown, summarise, type PositionRow } from './positions';

function position(over: Partial<PositionRow> = {}): PositionRow {
  const quantity = over.quantity ?? 10;
  const avgBuyPrice = over.avgBuyPrice ?? 100;
  const lastPrice = over.lastPrice === undefined ? 120 : over.lastPrice;
  const previousClose = over.previousClose === undefined ? 110 : over.previousClose;
  const invested = quantity * avgBuyPrice;
  const marketValue = lastPrice === null ? null : quantity * lastPrice;
  const gain = marketValue === null ? null : marketValue - invested;

  return {
    id: 'p1',
    ticker: 'TEST',
    exchange: 'NSE',
    company: 'Test Co',
    sector: 'IT Services',
    quantity,
    avgBuyPrice,
    buyDate: new Date('2026-01-01'),
    invested,
    lastPrice,
    previousClose,
    priceUpdatedAt: new Date('2026-08-01T10:00:00Z'),
    marketValue,
    gain,
    gainPercent: gain === null ? null : (gain / invested) * 100,
    dayChange:
      lastPrice === null || previousClose === null ? null : (lastPrice - previousClose) * quantity,
    dayChangePercent:
      lastPrice === null || previousClose === null
        ? null
        : ((lastPrice - previousClose) / previousClose) * 100,
    hasThesis: false,
    thesisScore: null,
    thesisPreviousScore: null,
    ...over,
  };
}

describe('summarise', () => {
  it('totals invested and market value', () => {
    const s = summarise([position(), position({ id: 'p2', quantity: 5 })]);
    expect(s.positionCount).toBe(2);
    expect(s.investedTotal).toBe(1500); // 10*100 + 5*100
    expect(s.marketValueTotal).toBe(1800); // 10*120 + 5*120
    expect(s.gainTotal).toBe(300);
    expect(s.gainPercent).toBeCloseTo(20);
  });

  it('computes day change against yesterday, not against cost', () => {
    const s = summarise([position()]);
    expect(s.dayChangeTotal).toBe(100); // (120-110)*10
    expect(s.dayChangePercent).toBeCloseTo(9.09, 2); // 100 / 1100
  });

  // A total that silently omits an unpriced holding would understate the
  // portfolio, which is worse than showing nothing.
  it('refuses to total when any position lacks a price', () => {
    const s = summarise([position(), position({ id: 'p2', lastPrice: null })]);
    expect(s.marketValueTotal).toBeNull();
    expect(s.gainTotal).toBeNull();
    expect(s.dayChangeTotal).toBeNull();
    expect(s.unpricedCount).toBe(1);
    // Cost basis is still known and still reported.
    expect(s.investedTotal).toBe(2000);
  });

  it('reports the oldest price as the as-of time', () => {
    const s = summarise([
      position({ priceUpdatedAt: new Date('2026-08-01T10:00:00Z') }),
      position({ id: 'p2', priceUpdatedAt: new Date('2026-07-28T10:00:00Z') }),
    ]);
    expect(s.pricedAsOf).toEqual(new Date('2026-07-28T10:00:00Z'));
  });

  it('flags prices older than a day as stale', () => {
    const asOf = new Date('2026-08-01T10:00:00Z');
    expect(
      summarise([position({ priceUpdatedAt: asOf })], new Date('2026-08-01T18:00:00Z')).pricesStale,
    ).toBe(false);
    expect(
      summarise([position({ priceUpdatedAt: asOf })], new Date('2026-08-03T18:00:00Z')).pricesStale,
    ).toBe(true);
  });

  it('handles an empty portfolio without dividing by zero', () => {
    const s = summarise([]);
    expect(s).toMatchObject({
      positionCount: 0,
      investedTotal: 0,
      marketValueTotal: null,
      gainPercent: null,
      pricedAsOf: null,
      pricesStale: false,
    });
  });

  it('counts positions with a thesis', () => {
    const s = summarise([position({ hasThesis: true }), position({ id: 'p2' })]);
    expect(s.withThesis).toBe(1);
  });
});

describe('sectorBreakdown', () => {
  it('groups by sector and sorts by size', () => {
    const slices = sectorBreakdown([
      position({ sector: 'Banking', quantity: 10 }), // 1200
      position({ id: 'p2', sector: 'IT Services', quantity: 30 }), // 3600
    ]);
    expect(slices.map((s) => s.sector)).toEqual(['IT Services', 'Banking']);
    expect(slices[0]?.percent).toBeCloseTo(75);
    expect(slices[1]?.percent).toBeCloseTo(25);
  });

  it('merges positions in the same sector', () => {
    const slices = sectorBreakdown([
      position({ sector: 'Banking' }),
      position({ id: 'p2', sector: 'Banking' }),
    ]);
    expect(slices).toHaveLength(1);
    expect(slices[0]?.percent).toBeCloseTo(100);
  });

  it('falls back to cost basis for unpriced holdings rather than dropping them', () => {
    const slices = sectorBreakdown([position({ sector: 'Pharma', lastPrice: null })]);
    expect(slices[0]).toMatchObject({ sector: 'Pharma', value: 1000 });
  });

  it('labels a missing sector rather than showing a blank', () => {
    expect(sectorBreakdown([position({ sector: null })])[0]?.sector).toBe('Unclassified');
  });

  it('returns nothing for an empty portfolio', () => {
    expect(sectorBreakdown([])).toEqual([]);
  });
});
