/**
 * The closed vocabulary of things a thesis assumption can be about.
 *
 * Everything downstream reads this registry: the fundamentals mapper, the
 * template defaults, the manual builder's metric picker, the assumptions
 * checklist, and the validator that stops the LLM inventing metric keys.
 * Adding a metric is one entry here plus one column on StockFundamentals.
 */

export type MetricKey =
  | 'trailing_pe'
  | 'price_to_book'
  | 'revenue_growth_yoy'
  | 'profit_margin'
  | 'return_on_equity'
  | 'debt_to_equity'
  | 'dividend_yield';

export type MetricUnit = 'percent' | 'ratio' | 'currency';

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  /** Shown under a slider or beside a threshold to say what is being measured. */
  description: string;
  unit: MetricUnit;
  /**
   * Which way is good. Used to pick a sensible default operator and to phrase
   * an assumption -- "PE below 25" reads right, "PE above 25" does not.
   */
  better: 'higher' | 'lower';
  /** Slider bounds. Wide enough to be usable, narrow enough to be meaningful. */
  min: number;
  max: number;
  step: number;
}

export const METRICS: Record<MetricKey, MetricDefinition> = {
  trailing_pe: {
    key: 'trailing_pe',
    label: 'P/E ratio',
    description: 'Price relative to the last twelve months of earnings.',
    unit: 'ratio',
    better: 'lower',
    min: 0,
    max: 100,
    step: 0.5,
  },
  price_to_book: {
    key: 'price_to_book',
    label: 'Price to book',
    description: 'Price relative to net asset value.',
    unit: 'ratio',
    better: 'lower',
    min: 0,
    max: 20,
    step: 0.1,
  },
  revenue_growth_yoy: {
    key: 'revenue_growth_yoy',
    label: 'Revenue growth (YoY)',
    description: 'Year-on-year change in revenue.',
    unit: 'percent',
    better: 'higher',
    min: -50,
    max: 100,
    step: 1,
  },
  profit_margin: {
    key: 'profit_margin',
    label: 'Profit margin',
    description: 'Net profit as a share of revenue.',
    unit: 'percent',
    better: 'higher',
    min: -20,
    max: 60,
    step: 0.5,
  },
  return_on_equity: {
    key: 'return_on_equity',
    label: 'Return on equity',
    description: 'Profit generated per rupee of shareholder equity.',
    unit: 'percent',
    better: 'higher',
    min: -20,
    max: 60,
    step: 0.5,
  },
  debt_to_equity: {
    key: 'debt_to_equity',
    label: 'Debt to equity',
    description: 'Borrowings relative to shareholder equity.',
    unit: 'ratio',
    better: 'lower',
    min: 0,
    max: 5,
    step: 0.05,
  },
  dividend_yield: {
    key: 'dividend_yield',
    label: 'Dividend yield',
    description: 'Annual dividend as a share of price.',
    unit: 'percent',
    better: 'higher',
    min: 0,
    max: 15,
    step: 0.1,
  },
};

export const METRIC_KEYS = Object.keys(METRICS) as MetricKey[];

export function isMetricKey(value: unknown): value is MetricKey {
  return typeof value === 'string' && value in METRICS;
}

export function getMetric(key: MetricKey): MetricDefinition {
  return METRICS[key];
}

export type Operator = '>' | '>=' | '<' | '<=' | '=';

export const OPERATORS: { value: Operator; label: string }[] = [
  { value: '>', label: 'is above' },
  { value: '>=', label: 'is at least' },
  { value: '<', label: 'is below' },
  { value: '<=', label: 'is at most' },
  { value: '=', label: 'equals' },
];

export function isOperator(value: unknown): value is Operator {
  return OPERATORS.some((o) => o.value === value);
}

/** Formats a metric value in its own units. Null renders as an em dash, never zero. */
export function formatMetric(key: MetricKey, value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const metric = METRICS[key];
  if (metric.unit === 'percent') return `${value.toFixed(1)}%`;
  return value.toFixed(2);
}

/** "Revenue growth (YoY) is above 10%" -- the sentence an assumption asserts. */
export function describeAssumption(key: MetricKey, operator: Operator, threshold: number): string {
  const label = METRICS[key].label;
  const op = OPERATORS.find((o) => o.value === operator)?.label ?? operator;
  return `${label} ${op} ${formatMetric(key, threshold)}`;
}
