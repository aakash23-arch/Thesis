'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

/**
 * Breaks the stale-token deadlock.
 *
 * `onboardedAt` lives in the JWT so the proxy can authorise on the edge without
 * a database round trip. But the proxy decodes the cookie directly -- it never
 * runs the `jwt` callback -- so a token minted before onboarding finished keeps
 * saying "not onboarded" even once the database disagrees. The proxy then sends
 * the user to /onboarding while this page's own check sends them back, and the
 * two loop.
 *
 * So when the database says onboarding is done but we got here anyway, force a
 * session refresh (which does run the `jwt` callback and re-issues the cookie)
 * and only then navigate. Rendering a redirect here instead would resume the
 * loop.
 */
export function SessionSync() {
  const router = useRouter();
  const { update } = useSession();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (done.current) return;
    done.current = true;

    void (async () => {
      await update();
      router.replace('/');
      router.refresh();
    })();
  }, [router, update]);

  return (
    <div className="flex items-center gap-3 text-body text-ink-secondary">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <p aria-live="polite">Finishing up...</p>
    </div>
  );
}
