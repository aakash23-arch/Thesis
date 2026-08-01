import { describe, expect, it } from 'vitest';
import {
  formatINR,
  formatINRCompact,
  formatPercent,
  formatSignedINR,
  formatSignedPercent,
} from './format';

describe('formatINR', () => {
  it('groups in the Indian convention, not thousands', () => {
    // 18,42,600 -- lakh grouping, which is what a broker statement shows.
    expect(formatINR(1842600)).toBe('₹18,42,600');
    expect(formatINR(100000)).toBe('₹1,00,000');
    expect(formatINR(999)).toBe('₹999');
  });

  it('puts the sign before the symbol', () => {
    expect(formatINR(-12400)).toBe('-₹12,400');
  });

  it('can drop the symbol and add decimals', () => {
    expect(formatINR(1842600, { symbol: false })).toBe('18,42,600');
    expect(formatINR(1584.2, { decimals: true })).toBe('₹1,584.20');
    expect(formatINR(-1584.2, { decimals: true })).toBe('-₹1,584.20');
  });

  it('handles zero without a sign', () => {
    expect(formatINR(0)).toBe('₹0');
  });
});

describe('formatINRCompact', () => {
  it('switches to crore and lakh at the right magnitudes', () => {
    expect(formatINRCompact(18426000)).toBe('₹1.84 Cr');
    expect(formatINRCompact(420000)).toBe('₹4.20 L');
    expect(formatINRCompact(99999)).toBe('₹99,999');
  });

  it('uses the boundary value itself for the larger unit', () => {
    expect(formatINRCompact(10000000)).toBe('₹1.00 Cr');
    expect(formatINRCompact(100000)).toBe('₹1.00 L');
  });

  it('keeps negatives readable', () => {
    expect(formatINRCompact(-18426000)).toBe('₹-1.84 Cr');
  });
});

describe('percentages', () => {
  it('formats plain percentages to one decimal by default', () => {
    expect(formatPercent(4.74)).toBe('4.7%');
    expect(formatPercent(4.74, 2)).toBe('4.74%');
  });

  it('always carries a sign when signed', () => {
    expect(formatSignedPercent(1.8)).toBe('+1.8%');
    expect(formatSignedPercent(-0.67)).toBe('-0.7%');
    expect(formatSignedPercent(0)).toBe('+0.0%');
  });
});

describe('formatSignedINR', () => {
  it('leads with an explicit sign for P&L', () => {
    expect(formatSignedINR(12400)).toBe('+₹12,400');
    expect(formatSignedINR(-12400)).toBe('-₹12,400');
  });
});
