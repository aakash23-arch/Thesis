'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { StockSearch } from '@/components/stocks/stock-search';
import { toast } from '@/components/ui/toast';
import type { StockSummary } from '@/lib/stocks/types';
import { addPosition } from '@/app/(dashboard)/portfolio/actions';
import {
  FormError,
  PositionFormFields,
  validatePositionValues,
  type PositionValues,
} from './position-form-fields';

const EMPTY: PositionValues = { quantity: '', avgBuyPrice: '', buyDate: '' };

export function AddPositionModal({ triggerLabel = 'Add position' }: { triggerLabel?: string }) {
  const [open, setOpen] = React.useState(false);
  const [stock, setStock] = React.useState<StockSummary | null>(null);
  const [values, setValues] = React.useState<PositionValues>(EMPTY);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const reset = () => {
    setStock(null);
    setValues(EMPTY);
    setErrors({});
    setFormError(null);
  };

  const submit = () => {
    const next = validatePositionValues(values);
    if (!stock) next.stock = 'Choose a stock.';
    setErrors(next);
    if (Object.keys(next).length > 0 || !stock) return;

    setFormError(null);
    startTransition(async () => {
      const result = await addPosition({
        ticker: stock.ticker,
        exchange: stock.exchange,
        quantity: values.quantity,
        avgBuyPrice: values.avgBuyPrice,
        buyDate: values.buyDate,
      });

      if (result.ok) {
        toast.success(`${stock.ticker} added`);
        setOpen(false);
        reset();
      } else {
        setFormError(result.error);
      }
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <ModalTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" aria-hidden />
          {triggerLabel}
        </Button>
      </ModalTrigger>

      <ModalContent size="lg">
        <ModalTitle>Add a position</ModalTitle>
        <ModalDescription>
          What you hold and what you paid. Prices come from the market; the thesis comes later.
        </ModalDescription>

        <ModalBody>
          <div className="mt-6 flex flex-col gap-6">
            <Field>
              <FieldLabel required>Stock</FieldLabel>
              <StockSearch
                value={stock}
                onSelect={(selected) => {
                  setStock(selected);
                  setErrors((prev) => ({ ...prev, stock: '' }));
                }}
                error={Boolean(errors.stock)}
              />
              {stock ? (
                <FieldHint>
                  {stock.ticker} &middot; {stock.company} &middot; {stock.sector}
                </FieldHint>
              ) : (
                <FieldHint>Nifty 50 companies for now.</FieldHint>
              )}
              <FieldError>{errors.stock}</FieldError>
            </Field>

            <PositionFormFields values={values} onChange={setValues} errors={errors} />
          </div>

          <FormError message={formError} />
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} loading={pending}>
            Add position
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
