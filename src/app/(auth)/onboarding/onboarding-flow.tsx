'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Field, FieldError, FieldHint, FieldLabel, useField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { StockSearch } from '@/components/stocks/stock-search';
import type { StockSummary } from '@/lib/stocks/types';
import { submitFirstPosition, submitInvestsIn, submitTracksWith } from './actions';

const TOTAL_STEPS = 3;

const INVESTS_IN = [
  { value: 'STOCKS', label: 'Individual stocks', hint: 'You pick companies yourself.' },
  { value: 'MUTUAL_FUNDS', label: 'Mutual funds', hint: 'You invest through schemes and SIPs.' },
  { value: 'BOTH', label: 'Both', hint: 'A mix of direct stocks and funds.' },
] as const;

const TRACKS_WITH = [
  { value: 'SPREADSHEET', label: 'A spreadsheet', hint: 'Excel, Google Sheets, or similar.' },
  { value: 'BROKER_APP', label: 'My broker’s app', hint: 'Whatever Zerodha or Groww shows you.' },
  { value: 'NOTHING', label: 'Nothing in particular', hint: 'You check in when you remember.' },
  { value: 'OTHER', label: 'Something else', hint: 'Another tool or your own system.' },
] as const;

interface ChoiceProps {
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}

function Choice({ label, hint, selected, onSelect }: ChoiceProps) {
  return (
    <Card
      interactive
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'flex items-start justify-between gap-4',
        selected && 'border-accent bg-accent-light hover:border-accent hover:bg-accent-light',
      )}
    >
      <span className="flex flex-col gap-1">
        <span className="text-body font-medium text-ink-primary">{label}</span>
        <span className="text-caption normal-case tracking-normal text-ink-secondary">{hint}</span>
      </span>
      {selected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />}
    </Card>
  );
}

function StepShell({
  step,
  title,
  description,
  children,
  footer,
  error,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-caption font-medium uppercase tracking-[0.04em] text-ink-secondary">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <Progress
          value={(step / TOTAL_STEPS) * 100}
          label={`Onboarding progress, step ${step} of ${TOTAL_STEPS}`}
        />
      </div>

      <div>
        <h1 className="font-serif text-page-title text-ink-primary">{title}</h1>
        <p className="mt-2 text-body text-ink-secondary">{description}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-card border border-signal-broken bg-signal-broken-light p-3"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-broken-ink" aria-hidden />
          <p className="text-caption normal-case tracking-normal text-signal-broken-ink">{error}</p>
        </div>
      )}

      {children}

      <div className="flex flex-wrap items-center justify-between gap-3">{footer}</div>
    </div>
  );
}

/** Quantity / price / date inputs, each wired through Field for aria. */
function PositionField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <Field>
      <FieldLabel required>{label}</FieldLabel>
      {children}
      {hint && !error && <FieldHint>{hint}</FieldHint>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function NumberInput({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Input
      {...useField()}
      {...rest}
      numeric
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export interface OnboardingFlowProps {
  step: number;
  initialInvestsIn: string | null;
  initialTracksWith: string | null;
}

export function OnboardingFlow({ step, initialInvestsIn, initialTracksWith }: OnboardingFlowProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [investsIn, setInvestsIn] = React.useState<string | null>(initialInvestsIn);
  const [tracksWith, setTracksWith] = React.useState<string | null>(initialTracksWith);

  const [stock, setStock] = React.useState<StockSummary | null>(null);
  const [quantity, setQuantity] = React.useState('');
  const [avgBuyPrice, setAvgBuyPrice] = React.useState('');
  const [buyDate, setBuyDate] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // The step lives in the URL, so back and refresh behave. Replace rather than
  // push on advance, so Back leaves onboarding instead of walking the steps
  // in reverse through history duplicates.
  const goToStep = (next: number) => router.push(`/onboarding?step=${next}`);

  const run = (
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
    onOk: () => void,
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) onOk();
      else setError(result.error);
    });
  };

  if (step === 1) {
    return (
      <StepShell
        step={1}
        title="What do you invest in?"
        description="This shapes what Thesis shows you first. You can change it later."
        error={error}
        footer={
          <>
            <span />
            <Button
              disabled={!investsIn}
              loading={pending}
              onClick={() =>
                investsIn &&
                run(
                  () => submitInvestsIn(investsIn),
                  () => goToStep(2),
                )
              }
            >
              Continue
            </Button>
          </>
        }
      >
        <div role="radiogroup" aria-label="What do you invest in?" className="flex flex-col gap-3">
          {INVESTS_IN.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              hint={option.hint}
              selected={investsIn === option.value}
              onSelect={() => setInvestsIn(option.value)}
            />
          ))}
        </div>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        step={2}
        title="How do you track your portfolio today?"
        description="No wrong answer. It tells us what you are moving away from."
        error={error}
        footer={
          <>
            <Button variant="ghost" onClick={() => goToStep(1)} disabled={pending}>
              Back
            </Button>
            <Button
              disabled={!tracksWith}
              loading={pending}
              onClick={() =>
                tracksWith &&
                run(
                  () => submitTracksWith(tracksWith),
                  () => goToStep(3),
                )
              }
            >
              Continue
            </Button>
          </>
        }
      >
        <div
          role="radiogroup"
          aria-label="How do you track your portfolio today?"
          className="flex flex-col gap-3"
        >
          {TRACKS_WITH.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              hint={option.hint}
              selected={tracksWith === option.value}
              onSelect={() => setTracksWith(option.value)}
            />
          ))}
        </div>
      </StepShell>
    );
  }

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!stock) errors.stock = 'Choose a stock.';
    if (!(Number(quantity) > 0)) errors.quantity = 'Quantity must be more than zero.';
    if (!(Number(avgBuyPrice) > 0)) errors.avgBuyPrice = 'Average price must be more than zero.';
    if (!buyDate) errors.buyDate = 'When did you buy it?';
    else if (new Date(buyDate) > new Date()) errors.buyDate = 'Buy date cannot be in the future.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const finish = () => {
    if (!validate() || !stock) return;
    run(
      () =>
        submitFirstPosition({
          ticker: stock.ticker,
          exchange: stock.exchange,
          quantity,
          avgBuyPrice,
          buyDate,
        }),
      () => router.push('/'),
    );
  };

  return (
    <StepShell
      step={3}
      title="Add your first position"
      description="One holding is enough to start. Thesis works out the rest from here."
      error={error}
      footer={
        <>
          <Button variant="ghost" onClick={() => goToStep(2)} disabled={pending}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() =>
                run(
                  () => submitFirstPosition(null),
                  () => router.push('/'),
                )
              }
            >
              Skip for now
            </Button>
            <Button loading={pending} onClick={finish}>
              Finish
            </Button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <Field>
          <FieldLabel required>Stock</FieldLabel>
          <StockSearch
            value={stock}
            onSelect={(selected) => {
              setStock(selected);
              setFieldErrors((prev) => ({ ...prev, stock: '' }));
            }}
            error={Boolean(fieldErrors.stock)}
          />
          {stock ? (
            <FieldHint>
              {stock.ticker} · {stock.company} · {stock.sector}
            </FieldHint>
          ) : (
            <FieldHint>Nifty 50 companies for now. The full universe lands shortly.</FieldHint>
          )}
          <FieldError>{fieldErrors.stock}</FieldError>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <PositionField label="Quantity" error={fieldErrors.quantity}>
            <NumberInput value={quantity} onChange={setQuantity} placeholder="0" />
          </PositionField>

          <PositionField label="Average buy price" error={fieldErrors.avgBuyPrice}>
            <NumberInput
              value={avgBuyPrice}
              onChange={setAvgBuyPrice}
              prefix="₹"
              placeholder="0.00"
            />
          </PositionField>
        </div>

        <PositionField
          label="Buy date"
          hint="Roughly is fine -- it anchors how long you have held the thesis."
          error={fieldErrors.buyDate}
        >
          <NumberInput type="date" value={buyDate} onChange={setBuyDate} />
        </PositionField>
      </div>
    </StepShell>
  );
}
