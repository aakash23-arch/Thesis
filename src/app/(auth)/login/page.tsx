import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { isAuthConfigured } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';

export const metadata: Metadata = { title: 'Sign in' };

/** next-auth reports failures by bouncing back here with ?error=. */
const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'That email is already registered through a different sign-in method. Use the one you signed up with.',
  AccessDenied: 'Google declined the sign-in request.',
  Configuration: 'Sign-in is misconfigured on our side. Nothing you did.',
  Verification: 'That sign-in link has expired. Request a new one.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const message = error ? (ERROR_MESSAGES[error] ?? 'Sign-in failed. Try again.') : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-page-title text-ink-primary">Thesis</h1>
        <p className="mt-2 max-w-md text-body text-ink-secondary">
          Your investments have reasons. Thesis tracks whether those reasons still hold.
        </p>
      </div>

      <Card className="flex flex-col gap-6">
        {message && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-card border border-signal-broken bg-signal-broken-light p-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-broken-ink" aria-hidden />
            <p className="text-caption normal-case tracking-normal text-signal-broken-ink">
              {message}
            </p>
          </div>
        )}

        {isAuthConfigured ? (
          <>
            <GoogleSignInButton callbackUrl={callbackUrl ?? '/'} />
            <p className="text-caption normal-case tracking-normal text-ink-tertiary">
              We read your name, email and profile picture. Nothing else, and nothing is ever posted
              on your behalf.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-body text-ink-primary">Sign-in is not configured yet.</p>
            <p className="text-caption normal-case tracking-normal text-ink-secondary">
              Set <code className="font-mono">GOOGLE_CLIENT_ID</code> and{' '}
              <code className="font-mono">GOOGLE_CLIENT_SECRET</code> in{' '}
              <code className="font-mono">.env</code>, then restart the dev server.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
