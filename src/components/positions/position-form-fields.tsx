'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Field, FieldError, FieldHint, FieldLabel, useField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

/** Quantity / price / date, shared by the add and edit modals. */
export interface PositionValues {
  quantity: string;
  avgBuyPrice: string;
  buyDate: string;
}

export function validatePositionValues(v: PositionValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!(Number(v.quantity) > 0)) errors.quantity = 'Quantity must be more than zero.';
  if (!(Number(v.avgBuyPrice) > 0)) errors.avgBuyPrice = 'Average price must be more than zero.';
  if (!v.buyDate) errors.buyDate = 'When did you buy it?';
  else if (new Date(v.buyDate) > new Date()) errors.buyDate = 'Buy date cannot be in the future.';
  return errors;
}

function ControlledInput({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  prefix?: React.ReactNode;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Input
      {...useField()}
      {...rest}
      numeric
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function PositionFormFields({
  values,
  onChange,
  errors,
}: {
  values: PositionValues;
  onChange: (next: PositionValues) => void;
  errors: Record<string, string>;
}) {
  const set = (key: keyof PositionValues) => (v: string) => onChange({ ...values, [key]: v });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel required>Quantity</FieldLabel>
          <ControlledInput value={values.quantity} onChange={set('quantity')} placeholder="0" />
          <FieldError>{errors.quantity}</FieldError>
        </Field>

        <Field>
          <FieldLabel required>Average buy price</FieldLabel>
          <ControlledInput
            value={values.avgBuyPrice}
            onChange={set('avgBuyPrice')}
            prefix="₹"
            placeholder="0.00"
          />
          <FieldError>{errors.avgBuyPrice}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel required>Buy date</FieldLabel>
        <ControlledInput type="date" value={values.buyDate} onChange={set('buyDate')} />
        {!errors.buyDate && <FieldHint>Anchors how long you have held the thesis.</FieldHint>}
        <FieldError>{errors.buyDate}</FieldError>
      </Field>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-card border border-signal-broken bg-signal-broken-light p-3"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-broken-ink" aria-hidden />
      <p className="text-caption normal-case tracking-normal text-signal-broken-ink">{message}</p>
    </div>
  );
}
