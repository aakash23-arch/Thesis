import { describe, expect, it } from 'vitest';
import { parseChartResponse, yahooSymbol } from './yahoo';

/** Trimmed to the fields the mapper reads, from a real BEL response. */
const VALID = {
  chart: {
    result: [
      {
        meta: {
          symbol: 'BEL.NS',
          regularMarketPrice: 387.85,
          chartPreviousClose: 384.9,
          regularMarketTime: 1785_500_000,
          currency: 'INR',
        },
      },
    ],
    error: null,
  },
};

describe('yahooSymbol', () => {
  it('suffixes by exchange', () => {
    expect(yahooSymbol('BEL', 'NSE')).toBe('BEL.NS');
    expect(yahooSymbol('BEL', 'BSE')).toBe('BEL.BO');
  });
});

describe('parseChartResponse', () => {
  it('maps a well-formed response', () => {
    const result = parseChartResponse(VALID, 'BEL', 'NSE');
    expect(result).toMatchObject({
      ticker: 'BEL',
      exchange: 'NSE',
      price: 387.85,
      previousClose: 384.9,
    });
    expect((result as { asOf: Date }).asOf).toEqual(new Date(1785_500_000 * 1000));
  });

  // Yahoo is undocumented and can change shape without warning. Each of these
  // must degrade to a reported failure, never a wrong number or a crash.
  it.each([
    ['a provider error', { chart: { result: null, error: { description: 'No data found' } } }],
    ['an empty result array', { chart: { result: [], error: null } }],
    ['a missing meta block', { chart: { result: [{}], error: null } }],
    ['a missing price', { chart: { result: [{ meta: { symbol: 'X' } }], error: null } }],
    ['a non-numeric price', { chart: { result: [{ meta: { regularMarketPrice: 'n/a' } }] } }],
    ['a NaN price', { chart: { result: [{ meta: { regularMarketPrice: NaN } }] } }],
    ['an unrelated payload', { something: 'else' }],
    ['null', null],
  ])('reports %s as an error rather than throwing', (_label, payload) => {
    const result = parseChartResponse(payload, 'X', 'NSE');
    expect(result).toHaveProperty('error');
  });

  it('accepts a quote with no previous close', () => {
    const result = parseChartResponse(
      { chart: { result: [{ meta: { regularMarketPrice: 100, regularMarketTime: 1 } }] } },
      'X',
      'NSE',
    );
    expect(result).toMatchObject({ price: 100, previousClose: null });
  });

  it('falls back to previousClose when chartPreviousClose is absent', () => {
    const result = parseChartResponse(
      { chart: { result: [{ meta: { regularMarketPrice: 100, previousClose: 98 } }] } },
      'X',
      'NSE',
    );
    expect(result).toMatchObject({ previousClose: 98 });
  });
});
