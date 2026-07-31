import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium uppercase tracking-[0.04em]',
  {
    variants: {
      variant: {
        healthy: 'bg-[#1A6B4A]/10 text-signal-healthy',
        caution: 'bg-[#C8922A]/10 text-signal-caution',
        broken: 'bg-[#B83A2E]/10 text-signal-broken',
        neutral: 'bg-[#4A7FBF]/10 text-signal-neutral',
        default: 'bg-recessed text-ink-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
