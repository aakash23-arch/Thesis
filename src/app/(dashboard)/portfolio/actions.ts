'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  archivePosition,
  createPosition,
  updatePosition,
  type PositionEditInput,
  type PositionInput,
} from '@/lib/positions';

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Identity always comes from the session, never from an argument. The lib
 * functions scope every query by the userId they are handed, so this is the
 * only place that decides whose data is being touched.
 */
async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  return session.user.id;
}

function toMessage(error: unknown, fallback: string): string {
  // Zod messages are written for humans; anything else is ours to own rather
  // than leak to the client.
  if (error instanceof Error && error.name === 'ZodError') {
    try {
      const issues = JSON.parse(error.message) as { message?: string }[];
      if (issues[0]?.message) return issues[0].message;
    } catch {
      /* fall through */
    }
  }
  if (error instanceof Error && error.message.startsWith('Unknown ticker')) return error.message;
  if (error instanceof Error && error.message === 'Position not found.') return error.message;
  return fallback;
}

function refresh() {
  revalidatePath('/portfolio');
  revalidatePath('/');
}

export async function addPosition(input: PositionInput): Promise<ActionResult> {
  try {
    await createPosition(await requireUserId(), input);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error, 'Could not add that position. Try again.') };
  }
}

export async function editPosition(
  positionId: string,
  input: PositionEditInput,
): Promise<ActionResult> {
  try {
    await updatePosition(await requireUserId(), positionId, input);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error, 'Could not save those changes. Try again.') };
  }
}

export async function closePosition(positionId: string): Promise<ActionResult> {
  try {
    await archivePosition(await requireUserId(), positionId);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error, 'Could not archive that position. Try again.') };
  }
}
