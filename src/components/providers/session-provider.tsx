'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * next-auth's provider is a client component, so it needs this wrapper to be
 * mounted from the server-rendered root layout.
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
