import type { MetricKey, Operator } from '@/lib/metrics';

export type TemplateId = 'growth' | 'value' | 'turnaround' | 'momentum';

export interface TemplateAssumption {
  metricKey: MetricKey;
  operator: Operator;
  defaultThreshold: number;
}

export interface ThesisTemplate {
  id: TemplateId;
  name: string;
  /** The one-line logic, shown before selection so the choice is informed. */
  rationale: string;
  /** Prefilled thesis text. The user edits it; it is a starting point, not a claim. */
  statement: string;
  assumptions: TemplateAssumption[];
}

/**
 * Four archetypes rather than a set per sector. Sector shapes the *thresholds*
 * (below), not the shape of the argument -- a growth case is a growth case
 * whether it is a bank or a pharma company.
 */
export const TEMPLATES: ThesisTemplate[] = [
  {
    id: 'growth',
    name: 'Growth case',
    rationale: 'The business is expanding fast enough to justify paying up for it.',
    statement:
      'Investors who hold this stock typically believe revenue will keep compounding at a high rate, that margins hold up as it scales, and that the premium valuation is earned by that growth.',
    assumptions: [
      { metricKey: 'revenue_growth_yoy', operator: '>', defaultThreshold: 15 },
      { metricKey: 'profit_margin', operator: '>', defaultThreshold: 10 },
      { metricKey: 'trailing_pe', operator: '<', defaultThreshold: 45 },
    ],
  },
  {
    id: 'value',
    name: 'Value case',
    rationale: 'The business is sound and the price does not reflect it.',
    statement:
      'Investors who hold this stock typically believe it trades below what the business is worth, that earnings are durable rather than temporarily inflated, and that the balance sheet can withstand a downturn while the gap closes.',
    assumptions: [
      { metricKey: 'trailing_pe', operator: '<', defaultThreshold: 18 },
      { metricKey: 'price_to_book', operator: '<', defaultThreshold: 3 },
      { metricKey: 'debt_to_equity', operator: '<', defaultThreshold: 1 },
    ],
  },
  {
    id: 'turnaround',
    name: 'Turnaround',
    rationale: 'Profitability is recovering, and the market has not repriced it yet.',
    statement:
      'Investors who hold this stock typically believe the worst is behind the business, that margins and returns are recovering from a low base, and that leverage stays manageable while the recovery plays out.',
    assumptions: [
      { metricKey: 'profit_margin', operator: '>', defaultThreshold: 5 },
      { metricKey: 'return_on_equity', operator: '>', defaultThreshold: 10 },
      { metricKey: 'debt_to_equity', operator: '<', defaultThreshold: 1.5 },
    ],
  },
  {
    id: 'momentum',
    name: 'Momentum',
    rationale: 'Results are accelerating, and that tends to persist for a while.',
    statement:
      'Investors who hold this stock typically believe the recent operating momentum continues, that growth is not being bought at the expense of profitability, and that returns on capital stay strong.',
    assumptions: [
      { metricKey: 'revenue_growth_yoy', operator: '>', defaultThreshold: 20 },
      { metricKey: 'return_on_equity', operator: '>', defaultThreshold: 15 },
      { metricKey: 'profit_margin', operator: '>', defaultThreshold: 8 },
    ],
  },
];

/**
 * Sector-specific threshold overrides.
 *
 * These are judgement, not research: a 15% revenue-growth bar is unremarkable
 * for IT Services and extraordinary for a utility, and banks are not usefully
 * measured on debt-to-equity at all. They exist so the sliders open somewhere
 * sensible -- the UI says plainly that they are starting points.
 */
const SECTOR_OVERRIDES: Record<string, Partial<Record<MetricKey, number>>> = {
  'IT Services': { revenue_growth_yoy: 10, profit_margin: 15, trailing_pe: 30 },
  Banking: { trailing_pe: 20, price_to_book: 3, return_on_equity: 14, profit_margin: 20 },
  'Financial Services': { trailing_pe: 22, price_to_book: 3.5, return_on_equity: 14 },
  Insurance: { trailing_pe: 25, price_to_book: 3, profit_margin: 8 },
  FMCG: { revenue_growth_yoy: 8, profit_margin: 12, trailing_pe: 50 },
  Pharma: { revenue_growth_yoy: 10, profit_margin: 15, trailing_pe: 35 },
  Auto: { revenue_growth_yoy: 10, profit_margin: 8, debt_to_equity: 1.5 },
  Metals: { revenue_growth_yoy: 5, profit_margin: 8, debt_to_equity: 1.5 },
  Energy: { revenue_growth_yoy: 5, profit_margin: 6, debt_to_equity: 1 },
  Power: { revenue_growth_yoy: 5, profit_margin: 10, debt_to_equity: 2 },
  Infrastructure: { revenue_growth_yoy: 10, profit_margin: 6, debt_to_equity: 2 },
  Cement: { revenue_growth_yoy: 8, profit_margin: 10, debt_to_equity: 1 },
  Telecom: { revenue_growth_yoy: 8, profit_margin: 5, debt_to_equity: 2.5 },
  Defence: { revenue_growth_yoy: 15, profit_margin: 15, trailing_pe: 45 },
  Mining: { revenue_growth_yoy: 5, profit_margin: 15, debt_to_equity: 1 },
};

export function getTemplate(id: TemplateId): ThesisTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * A template's assumptions with thresholds tuned to the sector, where we have
 * an opinion. Unknown sectors fall back to the archetype's own defaults.
 */
export function resolveTemplate(id: TemplateId, sector: string | null): TemplateAssumption[] {
  const template = getTemplate(id);
  if (!template) return [];

  const overrides = sector ? (SECTOR_OVERRIDES[sector] ?? {}) : {};

  return template.assumptions.map((assumption) => ({
    ...assumption,
    defaultThreshold: overrides[assumption.metricKey] ?? assumption.defaultThreshold,
  }));
}

export function isTemplateId(value: unknown): value is TemplateId {
  return TEMPLATES.some((t) => t.id === value);
}
