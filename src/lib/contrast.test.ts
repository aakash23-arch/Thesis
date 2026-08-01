import { describe, expect, it } from 'vitest';
import { contrastRatio, meetsAA, relativeLuminance } from './contrast';

const round = (n: number) => Math.round(n * 100) / 100;

describe('contrastRatio', () => {
  it('spans the full 1-21 range at the extremes', () => {
    expect(round(contrastRatio('#000000', '#FFFFFF'))).toBe(21);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
  });

  it('is symmetric in its arguments', () => {
    expect(contrastRatio('#0F1419', '#FFFFFF')).toBe(contrastRatio('#FFFFFF', '#0F1419'));
  });

  it('accepts shorthand hex', () => {
    expect(contrastRatio('#fff', '#000')).toBe(contrastRatio('#FFFFFF', '#000000'));
  });

  // These are the pairs the design system actually ships, verified against an
  // independent calculation when the -ink twins were chosen.
  it.each([
    ['#0F1419', '#FFFFFF', 18.51],
    ['#5C6670', '#FFFFFF', 5.85],
    ['#1A6B4A', '#FFFFFF', 6.47],
    ['#8A6318', '#FAF2E1', 4.86],
    ['#2F6099', '#EAF1F9', 5.67],
    ['#B83A2E', '#FBEBE9', 4.93],
  ])('rates %s on %s at %f:1', (fg, bg, expected) => {
    expect(round(contrastRatio(fg, bg))).toBe(expected);
  });

  it('confirms the two colours that forced the -ink twins do fail as text', () => {
    expect(contrastRatio('#C8922A', '#FFFFFF')).toBeLessThan(4.5);
    expect(contrastRatio('#4A7FBF', '#FFFFFF')).toBeLessThan(4.5);
  });
});

describe('meetsAA', () => {
  it('requires 4.5:1 for normal text and 3:1 for large', () => {
    // #4A7FBF on white is 4.13:1 -- fails as body text, passes as large text.
    expect(meetsAA('#4A7FBF', '#FFFFFF')).toBe(false);
    expect(meetsAA('#4A7FBF', '#FFFFFF', true)).toBe(true);
  });

  it('passes every shipped ink-on-tint pair', () => {
    expect(meetsAA('#1A6B4A', '#E8F5EE')).toBe(true);
    expect(meetsAA('#8A6318', '#FAF2E1')).toBe(true);
    expect(meetsAA('#B83A2E', '#FBEBE9')).toBe(true);
    expect(meetsAA('#2F6099', '#EAF1F9')).toBe(true);
  });
});

describe('relativeLuminance', () => {
  it('anchors at the ends of the range', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
  });
});
