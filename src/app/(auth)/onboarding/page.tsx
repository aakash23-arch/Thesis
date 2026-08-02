import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { OnboardingFlow } from './onboarding-flow';
import { SessionSync } from './session-sync';

export const metadata: Metadata = { title: 'Get started' };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const { step: rawStep } = await searchParams;
  const parsed = Number(rawStep);
  const step = Number.isInteger(parsed) && parsed >= 1 && parsed <= 3 ? parsed : 1;

  // Previously chosen answers, so a refresh or a Back does not blank the form.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { investsIn: true, tracksWith: true, onboardedAt: true },
  });

  // Already onboarded, yet the proxy let us through -- which means the token is
  // stale. Redirecting to '/' here would just bounce back off the proxy, so
  // refresh the session first. See SessionSync.
  if (user?.onboardedAt) return <SessionSync />;

  return (
    <OnboardingFlow
      step={step}
      initialInvestsIn={user?.investsIn ?? null}
      initialTracksWith={user?.tracksWith ?? null}
    />
  );
}
