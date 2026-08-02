import { z } from 'zod';
import { llmProvider } from '@/lib/llm';
import { formatMetric, isMetricKey, METRICS, METRIC_KEYS, type MetricKey } from '@/lib/metrics';

/**
 * The model may only speak in metrics we can actually check. A thesis whose
 * assumptions reference an invented metric is unverifiable, which defeats the
 * point -- so unknown keys are rejected, not coerced.
 */
const generatedSchema = z.object({
  thesis_text: z.string().trim().min(40).max(500),
  assumptions: z
    .array(
      z.object({
        metric: z.string().refine(isMetricKey, 'Unknown metric.'),
        operator: z.enum(['>', '<', '>=', '<=']),
        threshold: z.number().finite(),
      }),
    )
    .min(2)
    .max(4),
});

export interface GeneratedThesis {
  thesisText: string;
  assumptions: {
    metricKey: MetricKey;
    operator: '>' | '<' | '>=' | '<=';
    thresholdValue: number;
  }[];
}

const SYSTEM = `You are a financial data summariser for a portfolio tool used by Indian retail investors.

Given a company and its reported metrics, describe the investment case that holders of the stock typically hold. Then express it as measurable assumptions.

Hard rules:
- Never recommend buying, selling or holding. Never predict a price.
- Frame the thesis as "Investors who hold this stock typically believe...".
- Use ONLY these metric keys: ${METRIC_KEYS.join(', ')}.
- Thresholds must be plain numbers in the metric's own units: percentages as percentages (12.5 means 12.5%), ratios as ratios.
- Choose thresholds that the company currently meets or narrowly misses, so the assumptions are meaningful tests rather than trivially true or already hopeless.
- Output JSON only: {"thesis_text": string, "assumptions": [{"metric": string, "operator": ">"|"<"|">="|"<=", "threshold": number}]}`;

function describeMetrics(metrics: Partial<Record<MetricKey, number>>): string {
  const lines = METRIC_KEYS.filter((k) => metrics[k] !== undefined).map(
    (k) => `- ${METRICS[k].label} (${k}): ${formatMetric(k, metrics[k])}`,
  );
  return lines.length ? lines.join('\n') : '- No metrics are currently reported.';
}

/**
 * Drafts a Tier 0 thesis. The result is a starting point the user accepts,
 * edits or discards -- it is never saved without them seeing it.
 */
export async function generateThesis(input: {
  ticker: string;
  company: string;
  sector: string | null;
  metrics: Partial<Record<MetricKey, number>>;
}): Promise<GeneratedThesis> {
  const prompt = `Company: ${input.company} (${input.ticker})
Sector: ${input.sector ?? 'Unknown'}

Currently reported metrics:
${describeMetrics(input.metrics)}

Write the thesis and 3 assumptions.`;

  const raw = await llmProvider.generate({ system: SYSTEM, prompt, temperature: 0.4 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('The model returned something that was not JSON.');
  }

  // Validate rather than trust: a hallucinated metric key would produce an
  // assumption that silently never evaluates.
  const result = generatedSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('The model returned a thesis we could not use. Try again.');
  }

  return {
    thesisText: result.data.thesis_text,
    assumptions: result.data.assumptions.map((a) => ({
      metricKey: a.metric as MetricKey,
      operator: a.operator,
      thresholdValue: a.threshold,
    })),
  };
}
