'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel, useField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { submitDisplayName } from '@/app/(dashboard)/settings/actions';

function NameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <Input {...useField()} value={value} onChange={(e) => onChange(e.target.value)} />;
}

export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = React.useState(initialName);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const dirty = name.trim() !== initialName.trim();

  return (
    <form
      className="flex max-w-md flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await submitDisplayName(name);
          if (result.ok) toast.success('Profile updated');
          else setError(result.error);
        });
      }}
    >
      <Field>
        <FieldLabel>Name</FieldLabel>
        <NameInput value={name} onChange={setName} />
        <FieldError>{error}</FieldError>
      </Field>

      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input value={email} readOnly disabled />
        <FieldHint>Comes from your Google account and cannot be changed here.</FieldHint>
      </Field>

      <div>
        <Button type="submit" disabled={!dirty} loading={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
