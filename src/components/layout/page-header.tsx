import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 flex items-start justify-between gap-4', className)}>
      <div>
        <h1 className="font-serif text-page-title text-ink-primary">{title}</h1>
        {description && <p className="mt-1 text-body text-ink-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
