'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry lands in Session 8; until then the console is the record.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-content items-center px-4 py-8">
      <div className="w-full">
        <EmptyState
          icon={AlertTriangle}
          title="Something went wrong on our side"
          description="The page failed to load. Nothing you entered has been lost."
          action={
            <Button variant="secondary" onClick={reset}>
              Try again
            </Button>
          }
        />
        {error.digest && (
          <p className="mt-4 text-center font-mono text-caption text-ink-tertiary">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
