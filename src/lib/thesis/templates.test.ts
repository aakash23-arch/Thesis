import { describe, expect, it } from 'vitest';
import { isMetricKey, METRICS } from '@/lib/metrics';
import { resolveTemplate, TEMPLATES } from './templates';

describe('templates', () => {
  it('offers exactly the four archetypes from the spec', () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(['growth', 'value', 'turnaround', 'momentum']);
  });

  // An assumption on an unknown metric could never be checked.
  it('only references metrics in the registry', () => {
    for (const template of TEMPLATES) {
      for (const a of template.assumptions) {
        expect(isMetricKey(a.metricKey), `${template.id}/${a.metricKey}`).toBe(true);
      }
    }
  });

  it('states its logic before the user picks it', () => {
    for (const template of TEMPLATES) {
      expect(template.rationale.length).toBeGreaterThan(20);
      expect(template.statement).toContain('typically believe');
    }
  });

  it('keeps every default threshold inside its slider bounds', () => {
    for (const template of TEMPLATES) {
      for (const a of template.assumptions) {
        const metric = METRICS[a.metricKey];
        expect(a.defaultThreshold).toBeGreaterThanOrEqual(metric.min);
        expect(a.defaultThreshold).toBeLessThanOrEqual(metric.max);
      }
    }
  });
});

describe('resolveTemplate', () => {
  it('applies sector overrides where we have an opinion', () => {
    const generic = resolveTemplate('growth', null);
    const it_ = resolveTemplate('growth', 'IT Services');

    const genericGrowth = generic.find((a) => a.metricKey === 'revenue_growth_yoy');
    const itGrowth = it_.find((a) => a.metricKey === 'revenue_growth_yoy');

    expect(genericGrowth?.defaultThreshold).toBe(15);
    expect(itGrowth?.defaultThreshold).toBe(10);
  });

  it('falls back to the archetype default for an unknown sector', () => {
    expect(resolveTemplate('growth', 'Interplanetary Mining')).toEqual(
      resolveTemplate('growth', null),
    );
  });

  it('keeps overridden thresholds inside slider bounds too', () => {
    const sectors = ['Banking', 'IT Services', 'Pharma', 'Energy', 'Defence', 'Telecom'];
    for (const template of TEMPLATES) {
      for (const sector of sectors) {
        for (const a of resolveTemplate(template.id, sector)) {
          const metric = METRICS[a.metricKey];
          expect(
            a.defaultThreshold,
            `${template.id}/${sector}/${a.metricKey}`,
          ).toBeGreaterThanOrEqual(metric.min);
          expect(a.defaultThreshold).toBeLessThanOrEqual(metric.max);
        }
      }
    }
  });

  it('never changes which metrics or operators a template uses', () => {
    const generic = resolveTemplate('value', null);
    const banking = resolveTemplate('value', 'Banking');
    expect(banking.map((a) => a.metricKey)).toEqual(generic.map((a) => a.metricKey));
    expect(banking.map((a) => a.operator)).toEqual(generic.map((a) => a.operator));
  });
});
