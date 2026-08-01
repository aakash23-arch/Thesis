import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Small caption above the title, e.g. a sector or ticker. */
  eyebrow?: string;
  className?: string;
}

export function PageHeader({ title, description, action, eyebrow, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-caption font-medium uppercase tracking-[0.04em] text-ink-secondary">
            {eyebrow}
          </p>
        )}
        {/* Page titles are the display face -- one of the few places it appears. */}
        <h1 className="font-serif text-page-title text-ink-primary">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-body text-ink-secondary">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
    </div>
  );
}
