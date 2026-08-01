import { describe, expect, it } from 'vitest';
import {
  getHealthColor,
  getHealthLabel,
  getHealthStatus,
  getHealthTextColor,
  HEALTH_COLORS,
  HEALTH_TEXT_COLORS,
} from './health-score';

describe('getHealthStatus', () => {
  // The spec draws the bands at 0-49 broken, 50-79 caution, 80-100 healthy.
  // The boundaries are the only interesting inputs.
  it.each([
    [0, 'broken'],
    [49, 'broken'],
    [50, 'caution'],
    [79, 'caution'],
    [80, 'healthy'],
    [100, 'healthy'],
  ] as const)('scores %i as %s', (score, expected) => {
    expect(getHealthStatus(score)).toBe(expected);
  });

  it('treats out-of-range scores by band, not by clamping', () => {
    expect(getHealthStatus(-10)).toBe('broken');
    expect(getHealthStatus(150)).toBe('healthy');
  });
});

describe('colour lookups', () => {
  it('returns the spec fill colours', () => {
    expect(getHealthColor(84)).toBe('#1A6B4A');
    expect(getHealthColor(61)).toBe('#C8922A');
    expect(getHealthColor(32)).toBe('#B83A2E');
  });

  it('darkens only the caution text colour, leaving the fill untouched', () => {
    // #C8922A is 2.76:1 on white and fails AA as text, so the ink twin differs.
    expect(HEALTH_TEXT_COLORS.caution).not.toBe(HEALTH_COLORS.caution);
    expect(getHealthTextColor(61)).toBe('#8A6318');

    // The other two already pass, so fill and ink must stay identical.
    expect(HEALTH_TEXT_COLORS.healthy).toBe(HEALTH_COLORS.healthy);
    expect(HEALTH_TEXT_COLORS.broken).toBe(HEALTH_COLORS.broken);
  });
});

describe('getHealthLabel', () => {
  it('names each band', () => {
    expect(getHealthLabel(84)).toBe('Healthy');
    expect(getHealthLabel(61)).toBe('Caution');
    expect(getHealthLabel(32)).toBe('Broken');
  });
});
