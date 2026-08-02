'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import {
  completeOnboarding,
  saveInvestsIn,
  saveTracksWith,
  type FirstPositionInput,
} from '@/lib/onboarding';

/**
 * Thin wrappers over `lib/onboarding.ts`. They resolve the caller's identity
 * and translate results into navigation -- never trusting a userId from the
 * client, which would let anyone write to anyone's row.
 */

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  return session.user.id;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function submitInvestsIn(value: string): Promise<ActionResult> {
  try {
    await saveInvestsIn(await requireUserId(), value);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save that. Try again.' };
  }
}

export async function submitTracksWith(value: string): Promise<ActionResult> {
  try {
    await saveTracksWith(await requireUserId(), value);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save that. Try again.' };
  }
}

export async function submitFirstPosition(
  position: FirstPositionInput | null,
): Promise<ActionResult> {
  try {
    await completeOnboarding(await requireUserId(), position ?? undefined);
    return { ok: true };
  } catch (error) {
    // Zod messages are written for humans, so surface them; anything else is
    // ours to own rather than leak.
    const message =
      error instanceof Error && error.name === 'ZodError'
        ? 'Check the position details and try again.'
        : 'Could not save that position. Try again.';
    return { ok: false, error: message };
  }
}
