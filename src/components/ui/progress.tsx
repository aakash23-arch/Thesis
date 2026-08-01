import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0-100. */
  value: number;
  /** Bar colour. 'accent' for neutral progress, signals for scored states. */
  tone?: 'accent' | 'healthy' | 'caution' | 'broken' | 'neutral';
  size?: 'sm' | 'md';
  /** Accessible name; required unless the bar is labelled elsewhere via aria-labelledby. */
  label?: string;
}

const TONES: Record<NonNullable<ProgressProps['tone']>, string> = {
  accent: 'bg-accent',
  healthy: 'bg-signal-healthy',
  caution: 'bg-signal-caution',
  broken: 'bg-signal-broken',
  neutral: 'bg-signal-neutral',
};

/**
 * Horizontal meter for sub-scores. Deliberately plain -- the vertical
 * ThesisGauge is the signature instrument, and this must not compete with it.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, tone = 'accent', size = 'md', label, ...props }, ref) => {
    const clamped = Math.max(0, Math.min(100, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          'w-full overflow-hidden rounded-full bg-recessed',
          size === 'sm' ? 'h-1' : 'h-1.5',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-instrument ease-instrument',
            TONES[tone],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress };
