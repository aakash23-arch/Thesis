'use client';

import * as React from 'react';
import { Archive, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalTitle,
} from '@/components/ui/modal';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/toast';
import { closePosition, editPosition } from '@/app/(dashboard)/portfolio/actions';
import {
  FormError,
  PositionFormFields,
  validatePositionValues,
  type PositionValues,
} from './position-form-fields';

export interface PositionRowActionsProps {
  positionId: string;
  ticker: string;
  quantity: number;
  avgBuyPrice: number;
  buyDate: string;
  hasHistory: boolean;
}

export function PositionRowActions({
  positionId,
  ticker,
  quantity,
  avgBuyPrice,
  buyDate,
  hasHistory,
}: PositionRowActionsProps) {
  const initial: PositionValues = {
    quantity: String(quantity),
    avgBuyPrice: String(avgBuyPrice),
    buyDate,
  };

  const [editOpen, setEditOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [values, setValues] = React.useState<PositionValues>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const saveEdit = () => {
    const next = validatePositionValues(values);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFormError(null);
    startTransition(async () => {
      const result = await editPosition(positionId, {
        quantity: values.quantity,
        avgBuyPrice: values.avgBuyPrice,
        buyDate: values.buyDate,
      });
      if (result.ok) {
        toast.success(`${ticker} updated`);
        setEditOpen(false);
      } else {
        setFormError(result.error);
      }
    });
  };

  const archive = () => {
    setFormError(null);
    startTransition(async () => {
      const result = await closePosition(positionId);
      if (result.ok) {
        toast.success(`${ticker} archived`, { description: 'Its history has been kept.' });
        setArchiveOpen(false);
      } else {
        setFormError(result.error);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <SimpleTooltip content={`Edit ${ticker}`}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${ticker}`}
          onClick={() => {
            setValues(initial);
            setErrors({});
            setFormError(null);
            setEditOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
      </SimpleTooltip>

      <SimpleTooltip content={`Archive ${ticker}`}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Archive ${ticker}`}
          onClick={() => {
            setFormError(null);
            setArchiveOpen(true);
          }}
        >
          <Archive className="h-4 w-4" aria-hidden />
        </Button>
      </SimpleTooltip>

      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <ModalContent>
          <ModalTitle>Edit {ticker}</ModalTitle>
          <ModalDescription>
            The instrument stays the same &mdash; a different stock is a different position.
          </ModalDescription>
          <ModalBody>
            <div className="mt-6">
              <PositionFormFields values={values} onChange={setValues} errors={errors} />
            </div>
            <FormError message={formError} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={saveEdit} loading={pending}>
              Save changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={archiveOpen} onOpenChange={setArchiveOpen}>
        <ModalContent>
          <ModalTitle>Archive {ticker}?</ModalTitle>
          <ModalDescription>
            It leaves your portfolio and stops counting towards your totals.
          </ModalDescription>
          <ModalBody>
            {/* Say plainly what is kept. "Delete" language here would misdescribe
                what actually happens, and the history is the point of the product. */}
            <p className="mt-4 text-body text-ink-secondary">
              {hasHistory
                ? 'Its thesis and every decision you logged against it are kept. Nothing you wrote is deleted.'
                : 'Nothing is deleted — the record is kept, just out of the way.'}
            </p>
            <FormError message={formError} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setArchiveOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={archive} loading={pending}>
              Archive
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
