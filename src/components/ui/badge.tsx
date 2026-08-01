import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-caption font-medium uppercase tracking-[0.04em]',
  {
    variants: {
      // Tint + ink pairs from the token layer. Every combination clears WCAG AA.
      variant: {
        healthy: 'bg-signal-healthy-light text-signal-healthy-ink',
        caution: 'bg-signal-caution-light text-signal-caution-ink',
        broken: 'bg-signal-broken-light text-signal-broken-ink',
        neutral: 'bg-signal-neutral-light text-signal-neutral-ink',
        default: 'bg-recessed text-ink-secondary',
        outline: 'border border-border-strong bg-transparent text-ink-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

/** Dots use the undarkened signal fill -- they are shapes, not text. */
const DOT_COLORS: Record<BadgeVariant, string> = {
  healthy: 'bg-signal-healthy',
  caution: 'bg-signal-caution',
  broken: 'bg-signal-broken',
  neutral: 'bg-signal-neutral',
  default: 'bg-ink-tertiary',
  outline: 'bg-ink-tertiary',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Renders a small filled dot in the signal's fill colour before the label. */
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_COLORS[variant ?? 'default'])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
