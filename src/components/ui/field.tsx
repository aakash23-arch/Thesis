'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FieldContextValue {
  id: string;
  hintId: string;
  errorId: string;
  hasError: boolean;
  setHasHint: (has: boolean) => void;
  setHasError: (has: boolean) => void;
  hasHint: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext(component: string) {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error(`<${component}> must be used inside a <Field>.`);
  return ctx;
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Groups a label, control, hint and error, and wires the aria plumbing between
 * them. The control reads its props from `useField()`, so react-hook-form only
 * has to spread its register() output onto the control itself.
 */
function Field({ className, children, ...props }: FieldProps) {
  const base = React.useId();
  const [hasHint, setHasHint] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const value = React.useMemo<FieldContextValue>(
    () => ({
      id: `${base}-control`,
      hintId: `${base}-hint`,
      errorId: `${base}-error`,
      hasError,
      hasHint,
      setHasHint,
      setHasError,
    }),
    [base, hasError, hasHint],
  );

  return (
    <FieldContext.Provider value={value}>
      <div className={cn('flex flex-col gap-1.5', className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

/**
 * Props to spread onto the control inside a Field: `<Input {...useField()} />`.
 * Returns id, aria-describedby and the error flag the primitives understand.
 */
function useField() {
  const { id, hintId, errorId, hasError, hasHint } = useFieldContext('useField');
  const describedBy = [hasHint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return {
    id,
    error: hasError,
    'aria-describedby': describedBy || undefined,
  } as const;
}

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Appends a required marker with an accessible name. */
  required?: boolean;
}

function FieldLabel({ className, children, required = false, ...props }: FieldLabelProps) {
  const { id } = useFieldContext('FieldLabel');
  return (
    <label
      htmlFor={id}
      className={cn(
        'text-caption font-medium uppercase tracking-[0.04em] text-ink-secondary',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-signal-broken-ink" aria-hidden>
          *
        </span>
      )}
      {required && <span className="sr-only"> (required)</span>}
    </label>
  );
}

function FieldHint({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { hintId, setHasHint } = useFieldContext('FieldHint');

  React.useEffect(() => {
    setHasHint(true);
    return () => setHasHint(false);
  }, [setHasHint]);

  return (
    <p
      id={hintId}
      className={cn('text-caption normal-case tracking-normal text-ink-tertiary', className)}
      {...props}
    >
      {children}
    </p>
  );
}

function FieldError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { errorId, setHasError } = useFieldContext('FieldError');
  const present = Boolean(children);

  React.useEffect(() => {
    setHasError(present);
    return () => setHasError(false);
  }, [present, setHasError]);

  if (!present) return null;

  return (
    <p
      id={errorId}
      role="alert"
      className={cn('text-caption normal-case tracking-normal text-signal-broken-ink', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export { Field, FieldLabel, FieldHint, FieldError, useField };
