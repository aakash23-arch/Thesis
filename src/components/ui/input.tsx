import * as React from 'react';
import { cn } from '@/lib/utils';

// `prefix` is a legacy RDFa attribute typed as string, so it is omitted and
// redeclared as a slot.
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Renders the value in IBM Plex Mono with tabular figures -- money and metrics. */
  numeric?: boolean;
  /** Invalid state: red border plus aria-invalid for assistive tech. */
  error?: boolean;
  /** Static adornment inside the field, e.g. the rupee sign. */
  prefix?: React.ReactNode;
  /** Static adornment at the trailing edge, e.g. "%" or "x". */
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', numeric = false, error = false, prefix, suffix, ...props }, ref) => {
    const field = (
      <input
        type={type}
        aria-invalid={error || undefined}
        className={cn(
          'h-10 w-full rounded-card border border-border bg-surface px-3 py-2 text-body text-ink-primary transition-colors duration-instrument placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:bg-recessed disabled:opacity-60',
          numeric && 'font-mono tabular-nums',
          error && 'border-signal-broken focus-visible:ring-signal-broken',
          // Adornments own the border; the inner input goes bare.
          (prefix || suffix) &&
            'h-auto rounded-none border-0 bg-transparent px-0 focus-visible:ring-0',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (!prefix && !suffix) return field;

    return (
      <div
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-card border border-border bg-surface px-3 transition-colors duration-instrument focus-within:ring-2 focus-within:ring-border-focus',
          error && 'border-signal-broken focus-within:ring-signal-broken',
        )}
      >
        {prefix && (
          <span className="shrink-0 font-mono text-data-small text-ink-secondary" aria-hidden>
            {prefix}
          </span>
        )}
        {field}
        {suffix && (
          <span className="shrink-0 font-mono text-data-small text-ink-secondary" aria-hidden>
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
