'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  /** Shows a live "used / limit" counter. Pair with maxLength to hard-cap input. */
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error = false,
      showCount = false,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(String(defaultValue ?? ''));
    const current = isControlled ? String(value ?? '') : internal;

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternal(event.target.value);
      onChange?.(event);
    };

    const over = maxLength !== undefined && current.length > maxLength;

    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={ref}
          aria-invalid={error || over || undefined}
          maxLength={maxLength}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          className={cn(
            'min-h-[7.5rem] w-full resize-y rounded-card border border-border bg-surface px-3 py-2 text-body leading-relaxed text-ink-primary transition-colors duration-instrument placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:bg-recessed disabled:opacity-60',
            (error || over) && 'border-signal-broken focus-visible:ring-signal-broken',
            className,
          )}
          {...props}
        />
        {showCount && maxLength !== undefined && (
          <span
            className={cn(
              'self-end font-mono text-caption tabular-nums text-ink-tertiary',
              current.length > maxLength * 0.9 && 'text-signal-caution-ink',
              over && 'text-signal-broken-ink',
            )}
          >
            {current.length} / {maxLength}
          </span>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
