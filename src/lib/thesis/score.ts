import type { Operator } from '@/lib/metrics';

export type AssumptionStatus = 'HEALTHY' | 'CAUTION' | 'BROKEN' | 'UNEVALUATED';

/**
 * How close to the threshold counts as "under stress" rather than "holding".
 * An assumption about to break is not the same as one that has, and the
 * difference is what gives someone time to think before the alert fires.
 */
export const CAUTION_BAND = 0.1;

export interface EvaluableAssumption {
  metricKey: string;
  operator: Operator;
  thresholdValue: number;
  /** Null when the metric is not reported for this company. */
  currentValue: number | null;
}

function satisfies(current: number, operator: Operator, threshold: number): boolean {
  switch (operator) {
    case '>':
      return current > threshold;
    case '>=':
      return current >= threshold;
    case '<':
      return current < threshold;
    case '<=':
      return current <= threshold;
    case '=':
      return current === threshold;
  }
}

/**
 * Grades one assumption.
 *
 * A satisfied assumption sitting within the caution band of its threshold is
 * reported as CAUTION: still true, but only just. Equality operators have no
 * meaningful "nearly", so they are pass or fail.
 */
export function evaluateAssumption(assumption: EvaluableAssumption): AssumptionStatus {
  const { currentValue, operator, thresholdValue } = assumption;

  if (currentValue === null || !Number.isFinite(currentValue)) return 'UNEVALUATED';
  if (!satisfies(currentValue, operator, thresholdValue)) return 'BROKEN';
  if (operator === '=') return 'HEALTHY';

  // Proximity is measured against the threshold's own magnitude, so a band
  // around a PE of 40 is wider in absolute terms than one around a yield of 2.
  const scale = Math.abs(thresholdValue);
  if (scale === 0) return 'HEALTHY';

  const distance = Math.abs(currentValue - thresholdValue) / scale;
  return distance <= CAUTION_BAND ? 'CAUTION' : 'HEALTHY';
}

export interface ThesisScore {
  /** 0-100, or null when nothing could be evaluated. */
  score: number | null;
  statuses: AssumptionStatus[];
  evaluatedCount: number;
  brokenCount: number;
  cautionCount: number;
}

/**
 * Scores a thesis from its assumptions.
 *
 * All holding is 100; each broken assumption costs its full share and each
 * cautioned one costs half.
 *
 * Unevaluated assumptions are excluded from the denominator rather than
 * counted as passing. A claim we cannot check must not make a thesis look
 * healthy -- and when nothing at all is checkable the score is null, not zero,
 * so the gauge renders empty instead of "broken". We do not know, and the
 * product should say so.
 */
export function scoreThesis(assumptions: EvaluableAssumption[]): ThesisScore {
  const statuses = assumptions.map(evaluateAssumption);
  const evaluated = statuses.filter((s) => s !== 'UNEVALUATED');

  const brokenCount = statuses.filter((s) => s === 'BROKEN').length;
  const cautionCount = statuses.filter((s) => s === 'CAUTION').length;

  if (evaluated.length === 0) {
    return { score: null, statuses, evaluatedCount: 0, brokenCount, cautionCount };
  }

  const penalty = (brokenCount + cautionCount * 0.5) / evaluated.length;
  const score = Math.round((1 - penalty) * 100);

  return {
    score: Math.max(0, Math.min(100, score)),
    statuses,
    evaluatedCount: evaluated.length,
    brokenCount,
    cautionCount,
  };
}
