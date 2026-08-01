'use client';

import { Toaster as Sonner } from 'sonner';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';

/**
 * Toasts follow the signal rule: colour appears only to communicate state, and
 * only in the icon and a hairline border -- never as a filled background. Text
 * stays ink-primary so it reads like the rest of the document.
 */
function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={8}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-signal-healthy-ink" aria-hidden />,
        warning: <AlertTriangle className="h-4 w-4 text-signal-caution-ink" aria-hidden />,
        error: <XCircle className="h-4 w-4 text-signal-broken-ink" aria-hidden />,
        info: <Info className="h-4 w-4 text-signal-neutral-ink" aria-hidden />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-ink-secondary" aria-hidden />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group flex items-start gap-3 rounded-card border border-border bg-surface p-4 text-body text-ink-primary shadow-none',
          title: 'text-body font-medium text-ink-primary',
          description: 'text-caption normal-case tracking-normal text-ink-secondary',
          actionButton:
            'rounded-card bg-accent px-2.5 py-1 text-caption font-medium text-white hover:bg-accent-hover',
          cancelButton:
            'rounded-card bg-recessed px-2.5 py-1 text-caption font-medium text-ink-secondary hover:bg-border',
          closeButton: 'border-border bg-surface text-ink-tertiary hover:text-ink-primary',
          success: 'border-l-2 border-l-signal-healthy',
          warning: 'border-l-2 border-l-signal-caution',
          error: 'border-l-2 border-l-signal-broken',
          info: 'border-l-2 border-l-signal-neutral',
        },
      }}
    />
  );
}

export { Toaster };
export { toast } from 'sonner';
