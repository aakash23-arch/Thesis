import { describe, expect, it } from 'vitest';
import { rankStocks, SEARCH_RESULT_LIMIT } from './search';
import { NIFTY_50 } from './nifty50';

// `searchStocks` now queries Postgres; the ranking rules it delegates to stay
// pure, so they are still tested here without a database.
const searchStocks = async (q: string, limit?: number) => rankStocks([...NIFTY_50], q, limit);

const tickers = async (query: string) => (await searchStocks(query)).map((s) => s.ticker);

describe('rankStocks (the ordering behind searchStocks)', () => {
  it('returns nothing for an empty or whitespace query', async () => {
    expect(await searchStocks('')).toEqual([]);
    expect(await searchStocks('   ')).toEqual([]);
  });

  it('puts an exact ticker match first', async () => {
    const results = await tickers('itc');
    expect(results[0]).toBe('ITC');
  });

  it('ranks a ticker prefix above a company-name match', async () => {
    // "inf" prefixes INFY's ticker; it also appears inside "Infrastructure"
    // sector names and other companies. The ticker must win.
    const results = await tickers('inf');
    expect(results[0]).toBe('INFY');
  });

  it('finds companies by a word in the middle of the name', async () => {
    expect(await tickers('motors')).toContain('TATAMOTORS');
  });

  it('is case insensitive and ignores surrounding whitespace', async () => {
    expect(await tickers('  ReLiAnCe  ')).toContain('RELIANCE');
  });

  it('matches on company name when the ticker looks nothing like it', async () => {
    expect(await tickers('larsen')).toContain('LT');
  });

  it('returns an empty list when nothing matches', async () => {
    expect(await searchStocks('zzzzzz')).toEqual([]);
  });

  it('caps results at the limit', async () => {
    // A single letter matches many names.
    const many = await searchStocks('a');
    expect(many.length).toBeLessThanOrEqual(SEARCH_RESULT_LIMIT);

    const two = await searchStocks('a', 2);
    expect(two).toHaveLength(2);
  });

  it('breaks rank ties alphabetically so ordering is stable', async () => {
    const results = await tickers('baj');
    expect(results).toEqual([...results].sort());
  });

  it('returns whole summaries, not just tickers', async () => {
    const [first] = await searchStocks('infy');
    expect(first).toMatchObject({
      ticker: 'INFY',
      company: 'Infosys',
      exchange: 'NSE',
      sector: 'IT Services',
    });
  });
});
