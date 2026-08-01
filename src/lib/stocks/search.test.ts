import { describe, expect, it } from 'vitest';
import { findStock, searchStocks, SEARCH_RESULT_LIMIT } from './search';

const tickers = async (query: string) => (await searchStocks(query)).map((s) => s.ticker);

describe('searchStocks', () => {
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

describe('findStock', () => {
  it('resolves an exact ticker regardless of case', async () => {
    expect(await findStock('infy')).toMatchObject({ ticker: 'INFY' });
  });

  it('returns null for an unknown ticker', async () => {
    expect(await findStock('NOTREAL')).toBeNull();
  });

  it('honours the exchange filter', async () => {
    expect(await findStock('INFY', 'NSE')).not.toBeNull();
    expect(await findStock('INFY', 'BSE')).toBeNull();
  });

  it('does not match on a prefix', async () => {
    // Guards against a future refactor loosening this into a search.
    expect(await findStock('INF')).toBeNull();
  });
});
