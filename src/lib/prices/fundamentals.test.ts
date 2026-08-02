import { describe, expect, it } from 'vitest';
import { mapFundamentals } from './fundamentals';

/** Captured from a real BEL.NS quoteSummary response. */
const BEL = {
  summaryDetail: { trailingPE: 46.062946, dividendYield: 0.0112 },
  defaultKeyStatistics: { priceToBook: 11.818569 },
  financialData: {
    revenueGrowth: 0.249,
    profitMargins: 0.21403,
    returnOnEquity: null,
    debtToEquity: 0.273,
  },
};

describe('mapFundamentals', () => {
  it('maps a real payload into the metric vocabulary', () => {
    const m = mapFundamentals(BEL);
    expect(m.trailing_pe).toBeCloseTo(46.06, 2);
    expect(m.price_to_book).toBeCloseTo(11.82, 2);
  });

  it('converts fractional rates to percentages', () => {
    const m = mapFundamentals(BEL);
    expect(m.revenue_growth_yoy).toBeCloseTo(24.9, 4);
    expect(m.profit_margin).toBeCloseTo(21.403, 4);
    expect(m.dividend_yield).toBeCloseTo(1.12, 4);
  });

  // Yahoo reports debt/equity as a percentage. Read as a ratio, Infosys would
  // appear to carry nine times its equity in debt.
  it.each([
    ['Reliance', 36.653, 0.36653],
    ['TCS', 10.211, 0.10211],
    ['Infosys', 9.541, 0.09541],
    ['BEL', 0.273, 0.00273],
  ])('normalises %s debt/equity from percent to ratio', (_name, raw, expected) => {
    const m = mapFundamentals({ financialData: { debtToEquity: raw } });
    expect(m.debt_to_equity).toBeCloseTo(expected, 5);
  });

  it('omits metrics the provider does not report, rather than storing zero', () => {
    const m = mapFundamentals(BEL);
    // BEL genuinely has no ROE in the payload.
    expect('return_on_equity' in m).toBe(false);
    expect(m.return_on_equity).toBeUndefined();
  });

  it('keeps a genuine zero distinct from a missing value', () => {
    const m = mapFundamentals({ financialData: { revenueGrowth: 0 } });
    expect(m.revenue_growth_yoy).toBe(0);
    expect('revenue_growth_yoy' in m).toBe(true);
  });

  it.each([
    ['an empty object', {}],
    ['null', null],
    ['undefined', undefined],
    ['an unrelated shape', { chart: { result: [] } }],
    ['modules present but empty', { financialData: {}, summaryDetail: {} }],
    ['non-numeric values', { summaryDetail: { trailingPE: 'n/a' } }],
    ['NaN', { summaryDetail: { trailingPE: NaN } }],
  ])('returns an empty snapshot for %s rather than throwing', (_label, payload) => {
    expect(mapFundamentals(payload)).toEqual({});
  });
});
