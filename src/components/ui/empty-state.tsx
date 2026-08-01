import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  /** One line on what the user gets by acting -- not an apology for the absence. */
  description?: string;
  action?: React.ReactNode;
  /** 'inline' fits inside a table or card; 'panel' is the full-page treatment. */
  variant?: 'inline' | 'panel';
}

/**
 * Empty states are invitations to act. No sad faces, no dead ends -- state what
 * lands here and give the user the one action that fills it.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'panel',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        variant === 'panel'
          ? 'gap-4 rounded-card border border-dashed border-border-strong bg-surface px-6 py-16'
          : 'gap-3 py-8',
        className,
      )}
      {...props}
    >
      {Icon && (
        <span
          className={cn(
            'flex items-center justify-center rounded-full bg-recessed text-ink-tertiary',
            variant === 'panel' ? 'h-12 w-12' : 'h-9 w-9',
          )}
          aria-hidden
        >
          <Icon className={variant === 'panel' ? 'h-5 w-5' : 'h-4 w-4'} />
        </span>
      )}

      <div className="flex max-w-md flex-col gap-1">
        <p
          className={cn(
            'font-serif text-ink-primary',
            variant === 'panel' ? 'text-section-head' : 'text-body',
          )}
        >
          {title}
        </p>
        {description && <p className="text-body text-ink-secondary">{description}</p>}
      </div>

      {action && <div className="mt-2 flex items-center gap-3">{action}</div>}
    </div>
  );
}

export { EmptyState };
