import { CircleAlert, CircleCheck, CircleHelp, CircleX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { describeAssumption, formatMetric, isMetricKey, type Operator } from '@/lib/metrics';
import type { ThesisAssumptionView } from '@/lib/thesis';

const PRESENTATION = {
  HEALTHY: { icon: CircleCheck, variant: 'healthy' as const, label: 'Holding' },
  CAUTION: { icon: CircleAlert, variant: 'caution' as const, label: 'Under stress' },
  BROKEN: { icon: CircleX, variant: 'broken' as const, label: 'Broken' },
  UNEVALUATED: { icon: CircleHelp, variant: 'default' as const, label: 'Not checked' },
};

export function AssumptionsChecklist({ assumptions }: { assumptions: ThesisAssumptionView[] }) {
  return (
    <ul className="divide-y divide-border">
      {assumptions.map((a) => {
        const presentation = PRESENTATION[a.status];
        const Icon = presentation.icon;
        const claim = isMetricKey(a.metricKey)
          ? describeAssumption(a.metricKey, a.operator as Operator, a.thresholdValue)
          : a.metricKey;

        return (
          <li key={a.id} className="flex flex-wrap items-start gap-3 py-4 first:pt-0 last:pb-0">
            <Icon
              className={
                a.status === 'HEALTHY'
                  ? 'mt-0.5 h-4 w-4 shrink-0 text-signal-healthy-ink'
                  : a.status === 'CAUTION'
                    ? 'mt-0.5 h-4 w-4 shrink-0 text-signal-caution-ink'
                    : a.status === 'BROKEN'
                      ? 'mt-0.5 h-4 w-4 shrink-0 text-signal-broken-ink'
                      : 'mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary'
              }
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <p className="text-body text-ink-primary">{claim}</p>

              <p className="mt-1 text-caption normal-case tracking-normal text-ink-secondary">
                {a.status === 'UNEVALUATED' ? (
                  // Say why, rather than showing a dash that reads as zero.
                  <>This metric is not reported for this company, so it cannot be checked.</>
                ) : (
                  <>
                    Currently{' '}
                    <span className="font-mono tabular-nums text-ink-primary">
                      {isMetricKey(a.metricKey)
                        ? formatMetric(a.metricKey, a.currentValue)
                        : String(a.currentValue ?? '—')}
                    </span>
                    {a.lastCheckedAt && (
                      <>
                        {' '}
                        &middot; checked{' '}
                        {a.lastCheckedAt.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </>
                    )}
                  </>
                )}
              </p>
            </div>

            <Badge variant={presentation.variant} dot>
              {presentation.label}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
