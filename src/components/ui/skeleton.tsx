import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Matches the shape of what is loading. */
  variant?: 'text' | 'figure' | 'block' | 'circle';
}

const VARIANTS: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-4 rounded',
  figure: 'h-6 w-24 rounded',
  block: 'h-24 rounded-card',
  circle: 'h-8 w-8 rounded-full',
};

/**
 * Loading placeholder. The pulse is disabled automatically under
 * prefers-reduced-motion by the global reset in globals.css.
 */
function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse bg-recessed', VARIANTS[variant], className)}
      {...props}
    />
  );
}

/** Convenience: a stack of text lines, last one short like real prose. */
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" className={i === lines - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
