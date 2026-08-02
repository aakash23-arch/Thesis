import { describe, expect, it } from 'vitest';
import { evaluateAssumption, scoreThesis, type EvaluableAssumption } from './score';

const a = (over: Partial<EvaluableAssumption> = {}): EvaluableAssumption => ({
  metricKey: 'revenue_growth_yoy',
  operator: '>',
  thresholdValue: 10,
  currentValue: 20,
  ...over,
});

describe('evaluateAssumption', () => {
  it('grades a comfortably satisfied assumption as healthy', () => {
    expect(evaluateAssumption(a({ currentValue: 20 }))).toBe('HEALTHY');
  });

  it('grades an unsatisfied assumption as broken', () => {
    expect(evaluateAssumption(a({ currentValue: 5 }))).toBe('BROKEN');
  });

  // Still true, but only just -- the warning that buys time to think.
  it('grades a satisfied assumption near its threshold as caution', () => {
    expect(evaluateAssumption(a({ currentValue: 10.5 }))).toBe('CAUTION');
  });

  it('places the caution band at exactly 10% of the threshold', () => {
    expect(evaluateAssumption(a({ currentValue: 11 }))).toBe('CAUTION'); // exactly 10%
    expect(evaluateAssumption(a({ currentValue: 11.01 }))).toBe('HEALTHY'); // just outside
  });

  it('is exact at the boundary itself', () => {
    // > 10 with 10 is false.
    expect(evaluateAssumption(a({ currentValue: 10, operator: '>' }))).toBe('BROKEN');
    // >= 10 with 10 is true, and sits on the threshold, so caution.
    expect(evaluateAssumption(a({ currentValue: 10, operator: '>=' }))).toBe('CAUTION');
  });

  it.each([
    ['<', 5, 'HEALTHY'],
    ['<', 15, 'BROKEN'],
    ['<', 9.5, 'CAUTION'],
    ['<=', 10, 'CAUTION'],
  ] as const)('handles the %s operator at %d', (operator, currentValue, expected) => {
    expect(evaluateAssumption(a({ operator, currentValue }))).toBe(expected);
  });

  it('treats equality as pass or fail, with no nearly', () => {
    expect(evaluateAssumption(a({ operator: '=', currentValue: 10 }))).toBe('HEALTHY');
    expect(evaluateAssumption(a({ operator: '=', currentValue: 10.5 }))).toBe('BROKEN');
  });

  it('reports a missing metric as unevaluated, never as passing', () => {
    expect(evaluateAssumption(a({ currentValue: null }))).toBe('UNEVALUATED');
    expect(evaluateAssumption(a({ currentValue: NaN }))).toBe('UNEVALUATED');
  });

  it('does not divide by zero on a zero threshold', () => {
    expect(evaluateAssumption(a({ thresholdValue: 0, currentValue: 1 }))).toBe('HEALTHY');
    expect(evaluateAssumption(a({ thresholdValue: 0, currentValue: -1 }))).toBe('BROKEN');
  });

  it('handles negative thresholds by magnitude', () => {
    // "margin above -10%", currently -9.5% -- true, and within 10% of -10.
    expect(evaluateAssumption(a({ thresholdValue: -10, currentValue: -9.5 }))).toBe('CAUTION');
    expect(evaluateAssumption(a({ thresholdValue: -10, currentValue: 20 }))).toBe('HEALTHY');
  });
});

describe('scoreThesis', () => {
  it('scores 100 when everything holds', () => {
    expect(scoreThesis([a(), a(), a()]).score).toBe(100);
  });

  it('deducts a full share per broken assumption', () => {
    const result = scoreThesis([a(), a(), a({ currentValue: 1 })]);
    expect(result.score).toBe(67); // 1 - 1/3
    expect(result.brokenCount).toBe(1);
  });

  it('deducts half a share for caution', () => {
    const result = scoreThesis([a(), a({ currentValue: 10.5 })]);
    expect(result.score).toBe(75); // 1 - 0.5/2
    expect(result.cautionCount).toBe(1);
  });

  it('scores 0 when everything is broken', () => {
    expect(scoreThesis([a({ currentValue: 1 }), a({ currentValue: 1 })]).score).toBe(0);
  });

  // The central rule: an unverifiable claim must not prop up a score.
  it('excludes unevaluated assumptions from the denominator', () => {
    const result = scoreThesis([a(), a({ currentValue: 1 }), a({ currentValue: null })]);
    // One of two evaluable assumptions is broken -- 50, not 67.
    expect(result.score).toBe(50);
    expect(result.evaluatedCount).toBe(2);
  });

  it('returns null, not zero, when nothing can be evaluated', () => {
    const result = scoreThesis([a({ currentValue: null }), a({ currentValue: null })]);
    expect(result.score).toBeNull();
    expect(result.evaluatedCount).toBe(0);
  });

  it('returns null for a thesis with no assumptions at all', () => {
    expect(scoreThesis([]).score).toBeNull();
  });

  it('reports a status for every assumption, including unevaluated ones', () => {
    const result = scoreThesis([a(), a({ currentValue: null })]);
    expect(result.statuses).toEqual(['HEALTHY', 'UNEVALUATED']);
  });

  it('never leaves the 0-100 range', () => {
    const result = scoreThesis(Array.from({ length: 7 }, () => a({ currentValue: -999 })));
    expect(result.score).toBe(0);
  });
});
