import { z } from 'zod';
import { db } from '@/lib/db';
import { isMetricKey, isOperator, type MetricKey, type Operator } from '@/lib/metrics';
import { scoreThesis, type AssumptionStatus, type EvaluableAssumption } from './score';

export * from './score';
export * from './templates';

/** Maps a metric key onto its column on StockFundamentals. */
const METRIC_COLUMN: Record<MetricKey, string> = {
  trailing_pe: 'trailingPe',
  price_to_book: 'priceToBook',
  revenue_growth_yoy: 'revenueGrowthYoy',
  profit_margin: 'profitMargin',
  return_on_equity: 'returnOnEquity',
  debt_to_equity: 'debtToEquity',
  dividend_yield: 'dividendYield',
};

export const assumptionInputSchema = z.object({
  metricKey: z.string().refine(isMetricKey, 'Unknown metric.'),
  operator: z.string().refine(isOperator, 'Unknown operator.'),
  thresholdValue: z.coerce.number().finite('Threshold must be a number.'),
  /** Optional prose; falls back to a generated sentence. */
  text: z.string().max(200).optional(),
});

export const thesisInputSchema = z.object({
  tier: z.enum(['TIER_0', 'TIER_1', 'TIER_2']),
  thesisText: z.string().trim().min(1, 'Write what you believe.').max(500),
  thesisTemplateId: z.string().nullable().optional(),
  convictionLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  timeHorizonMonths: z.coerce.number().int().positive(),
  assumptions: z.array(assumptionInputSchema).min(1, 'A thesis needs at least one assumption.'),
});

export type ThesisInput = z.input<typeof thesisInputSchema>;

/** Reads the stored metrics for a stock into the registry's vocabulary. */
async function metricsForTicker(
  ticker: string,
  exchange: string,
): Promise<{ values: Partial<Record<MetricKey, number>>; fetchedAt: Date | null }> {
  const stock = await db.stock.findFirst({
    where: { ticker, exchange },
    select: { fundamentals: true },
  });

  const f = stock?.fundamentals;
  if (!f) return { values: {}, fetchedAt: null };

  const values: Partial<Record<MetricKey, number>> = {};
  for (const [key, column] of Object.entries(METRIC_COLUMN) as [MetricKey, string][]) {
    const raw = (f as unknown as Record<string, unknown>)[column];
    if (raw !== null && raw !== undefined) values[key] = Number(raw);
  }
  return { values, fetchedAt: f.fetchedAt };
}

/**
 * Re-checks every assumption on a thesis against the latest fundamentals and
 * rewrites the score.
 *
 * The previous score is preserved on each recompute -- that is what the gauge's
 * etched tick mark reads, and it is the only way someone sees direction rather
 * than just level.
 */
export async function recomputeThesisHealth(thesisId: string): Promise<number | null> {
  const thesis = await db.thesis.findUnique({
    where: { id: thesisId },
    select: {
      healthScore: true,
      assumptions: true,
      position: { select: { ticker: true, exchange: true } },
    },
  });
  if (!thesis) return null;

  const { values, fetchedAt } = await metricsForTicker(
    thesis.position.ticker,
    thesis.position.exchange,
  );

  const evaluable: EvaluableAssumption[] = thesis.assumptions.map((a) => ({
    metricKey: a.metricKey,
    operator: a.operator as Operator,
    thresholdValue: Number(a.thresholdValue),
    currentValue: isMetricKey(a.metricKey) ? (values[a.metricKey] ?? null) : null,
  }));

  const { score, statuses } = scoreThesis(evaluable);

  await db.$transaction([
    ...thesis.assumptions.map((a, i) => {
      const status = statuses[i]!;
      return db.assumption.update({
        where: { id: a.id },
        data: {
          currentValue: evaluable[i]!.currentValue,
          // The schema's HealthStatus has no UNEVALUATED member; an unchecked
          // assumption is recorded as CAUTION and distinguished in the UI by
          // its null currentValue. Never HEALTHY -- that would imply we looked.
          status: status === 'UNEVALUATED' ? 'CAUTION' : status,
          lastCheckedAt: status === 'UNEVALUATED' ? null : (fetchedAt ?? new Date()),
        },
      });
    }),
    db.thesis.update({
      where: { id: thesisId },
      data: { healthScore: score, previousHealthScore: thesis.healthScore },
    }),
  ]);

  return score;
}

function assumptionText(input: z.infer<typeof assumptionInputSchema>): string {
  return input.text?.trim() ? input.text.trim() : '';
}

/**
 * Creates a thesis for a position, replacing any existing one.
 *
 * Scoped by userId throughout: a positionId from the client is never trusted
 * on its own.
 */
export async function saveThesis(
  userId: string,
  positionId: string,
  input: ThesisInput,
): Promise<string> {
  const parsed = thesisInputSchema.parse(input);

  const position = await db.position.findFirst({
    where: { id: positionId, userId },
    select: { id: true },
  });
  if (!position) throw new Error('Position not found.');

  // One active thesis per position: filing a new one replaces the old.
  const existing = await db.thesis.findFirst({
    where: { positionId, userId },
    select: { id: true },
  });
  if (existing) await db.thesis.delete({ where: { id: existing.id } });

  const created = await db.thesis.create({
    data: {
      positionId,
      userId,
      tier: parsed.tier,
      thesisText: parsed.thesisText,
      thesisTemplateId: parsed.thesisTemplateId ?? null,
      convictionLevel: parsed.convictionLevel,
      timeHorizonMonths: parsed.timeHorizonMonths,
      assumptions: {
        create: parsed.assumptions.map((a) => ({
          text: assumptionText(a),
          metricKey: a.metricKey,
          operator: a.operator,
          thresholdValue: a.thresholdValue,
        })),
      },
    },
    select: { id: true },
  });

  await recomputeThesisHealth(created.id);
  return created.id;
}

export interface ThesisAssumptionView {
  id: string;
  metricKey: string;
  operator: string;
  thresholdValue: number;
  currentValue: number | null;
  status: AssumptionStatus;
  lastCheckedAt: Date | null;
}

export interface ThesisView {
  id: string;
  tier: string;
  thesisText: string;
  convictionLevel: string;
  timeHorizonMonths: number;
  healthScore: number | null;
  previousHealthScore: number | null;
  createdAt: Date;
  updatedAt: Date;
  assumptions: ThesisAssumptionView[];
}

export async function getThesisForPosition(
  userId: string,
  positionId: string,
): Promise<ThesisView | null> {
  const thesis = await db.thesis.findFirst({
    where: { positionId, userId },
    include: { assumptions: { orderBy: { id: 'asc' } } },
  });
  if (!thesis) return null;

  return {
    id: thesis.id,
    tier: thesis.tier,
    thesisText: thesis.thesisText,
    convictionLevel: thesis.convictionLevel,
    timeHorizonMonths: thesis.timeHorizonMonths,
    healthScore: thesis.healthScore,
    previousHealthScore: thesis.previousHealthScore,
    createdAt: thesis.createdAt,
    updatedAt: thesis.updatedAt,
    assumptions: thesis.assumptions.map((a) => ({
      id: a.id,
      metricKey: a.metricKey,
      operator: a.operator,
      thresholdValue: Number(a.thresholdValue),
      currentValue: a.currentValue === null ? null : Number(a.currentValue),
      // A null currentValue means we never managed to check it, whatever the
      // stored status says.
      status: a.currentValue === null ? 'UNEVALUATED' : (a.status as AssumptionStatus),
      lastCheckedAt: a.lastCheckedAt,
    })),
  };
}
