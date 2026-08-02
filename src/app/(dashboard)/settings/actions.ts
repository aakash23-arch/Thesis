'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { updateDisplayName } from '@/lib/onboarding';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function submitDisplayName(name: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  try {
    await updateDisplayName(session.user.id, name);
    revalidatePath('/settings');
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'ZodError'
        ? 'Name must be between 1 and 80 characters.'
        : 'Could not save your name. Try again.';
    return { ok: false, error: message };
  }
}
