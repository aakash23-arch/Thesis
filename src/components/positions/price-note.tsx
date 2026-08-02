import { AlertTriangle, Clock } from 'lucide-react';

/**
 * Says how old the prices are, always.
 *
 * Prices are the first place this product can mislead: a number with no
 * timestamp reads as live. So the date is stated whenever figures are shown,
 * and called out when it is more than a day old.
 */
export function PriceNote({
  pricedAsOf,
  stale,
  unpricedCount,
}: {
  pricedAsOf: Date | null;
  /** Computed by `summarise` -- reading the clock during render is not pure. */
  stale: boolean;
  unpricedCount: number;
}) {
  if (!pricedAsOf && unpricedCount === 0) return null;

  const when = pricedAsOf?.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {pricedAsOf && (
        <span
          className={
            stale
              ? 'inline-flex items-center gap-1.5 text-caption normal-case tracking-normal text-signal-caution-ink'
              : 'inline-flex items-center gap-1.5 text-caption normal-case tracking-normal text-ink-tertiary'
          }
        >
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Prices as of {when}
          {stale && ' — not live'}
        </span>
      )}

      {unpricedCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-caption normal-case tracking-normal text-signal-caution-ink">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {unpricedCount === 1
            ? '1 holding has no price yet, so totals exclude it'
            : `${unpricedCount} holdings have no price yet, so totals exclude them`}
        </span>
      )}
    </div>
  );
}
