'use client';

import { Toaster as Sonner } from 'sonner';

function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'rounded-card border border-border bg-surface text-ink-primary shadow-none text-body',
          title: 'text-ink-primary font-medium',
          description: 'text-ink-secondary',
          actionButton: 'bg-accent text-white',
          cancelButton: 'bg-recessed text-ink-secondary',
        },
      }}
    />
  );
}

export { Toaster };
export { toast } from 'sonner';
