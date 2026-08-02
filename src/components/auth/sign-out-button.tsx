'use client';

import * as React from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const [pending, setPending] = React.useState(false);

  return (
    <Button
      variant="secondary"
      loading={pending}
      onClick={() => {
        setPending(true);
        void signOut({ callbackUrl: '/login' });
      }}
    >
      {!pending && <LogOut className="h-4 w-4" aria-hidden />}
      Sign out
    </Button>
  );
}
