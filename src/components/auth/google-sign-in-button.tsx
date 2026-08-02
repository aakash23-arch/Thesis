'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

/** Google's mark, inlined -- the CSP forbids loading it from a remote host. */
function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.11 0 5.72-1.03 7.62-2.8l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.02-6.45-4.74H1.71v2.98A11.5 11.5 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.55 14.67a6.9 6.9 0 0 1 0-4.41V7.28H1.71a11.51 11.51 0 0 0 0 10.37l3.84-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.2 15.11 0 12 0 7.5 0 3.61 2.58 1.71 6.34l3.84 2.98C6.46 6.77 9 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const [pending, setPending] = React.useState(false);

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      loading={pending}
      onClick={() => {
        setPending(true);
        void signIn('google', { callbackUrl });
      }}
    >
      {!pending && <GoogleMark />}
      Continue with Google
    </Button>
  );
}
