import * as React from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Caption-cased label, e.g. "Portfolio value". */
  label: string;
  /** The figure itself. Pass a preformatted string -- see lib/format.ts. */
  value: React.ReactNode;
  /** Secondary line under the figure. */
  hint?: string;
  /** Signed change rendered beside the figure. Direction drives the colour. */
  delta?: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    /** Up is not always good -- an expense ratio rising is a caution. */
    intent?: 'positive' | 'negative' | 'neutral';
  };
  loading?: boolean;
  /** Renders without the card chrome, for use inside an existing Card. */
  bare?: boolean;
}

const DELTA_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
} as const;

/**
 * Label + figure + change. The repeated unit of every overview surface:
 * portfolio value, day change, DQS, overlap score.
 */
const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  ({ className, label, value, hint, delta, loading = false, bare = false, ...props }, ref) => {
    // Direction sets the arrow; intent sets the colour. Default maps up to
    // positive, which is right for value and wrong for fees -- hence the override.
    const intent =
      delta?.intent ??
      (delta?.direction === 'up'
        ? 'positive'
        : delta?.direction === 'down'
          ? 'negative'
          : 'neutral');

    const DeltaIcon = delta ? DELTA_ICONS[delta.direction] : null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-1',
          !bare && 'rounded-card border border-border bg-surface p-6',
          className,
        )}
        {...props}
      >
        <span className="text-caption font-medium uppercase tracking-[0.04em] text-ink-secondary">
          {label}
        </span>

        {loading ? (
          <Skeleton variant="figure" className="mt-1 h-7 w-32" />
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-data-figure tabular-nums text-ink-primary">
              {value}
            </span>
            {delta && DeltaIcon && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-mono text-data-small tabular-nums',
                  intent === 'positive' && 'text-signal-healthy-ink',
                  intent === 'negative' && 'text-signal-broken-ink',
                  intent === 'neutral' && 'text-ink-secondary',
                )}
              >
                <DeltaIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {delta.value}
              </span>
            )}
          </div>
        )}

        {hint && (
          <span className="text-caption normal-case tracking-normal text-ink-tertiary">{hint}</span>
        )}
      </div>
    );
  },
);
StatTile.displayName = 'StatTile';

export { StatTile };
