'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { saveThesis, type ThesisInput } from '@/lib/thesis';
import { generateThesis, type GeneratedThesis } from '@/lib/thesis/generate';
import type { MetricKey } from '@/lib/metrics';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  return session.user.id;
}

function toMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.name === 'ZodError') {
    try {
      const issues = JSON.parse(error.message) as { message?: string }[];
      if (issues[0]?.message) return issues[0].message;
    } catch {
      /* fall through */
    }
  }
  if (error instanceof Error && error.message === 'Position not found.') return error.message;
  return fallback;
}

export type GenerateResult = { ok: true; draft: GeneratedThesis } | { ok: false; error: string };

/**
 * Drafts a Tier 0 thesis. Returns it for the user to accept or edit -- nothing
 * is saved until they do.
 */
export async function draftThesis(positionId: string): Promise<GenerateResult> {
  const userId = await requireUserId();

  const position = await db.position.findFirst({
    where: { id: positionId, userId },
    select: { ticker: true, exchange: true, sector: true },
  });
  if (!position) return { ok: false, error: 'Position not found.' };

  const stock = await db.stock.findFirst({
    where: { ticker: position.ticker, exchange: position.exchange },
    select: { company: true, sector: true, fundamentals: true },
  });

  const metrics: Partial<Record<MetricKey, number>> = {};
  if (stock?.fundamentals) {
    const f = stock.fundamentals as unknown as Record<string, unknown>;
    const pairs: [string, MetricKey][] = [
      ['trailingPe', 'trailing_pe'],
      ['priceToBook', 'price_to_book'],
      ['revenueGrowthYoy', 'revenue_growth_yoy'],
      ['profitMargin', 'profit_margin'],
      ['returnOnEquity', 'return_on_equity'],
      ['debtToEquity', 'debt_to_equity'],
      ['dividendYield', 'dividend_yield'],
    ];
    for (const [column, key] of pairs) {
      const raw = f[column];
      if (raw !== null && raw !== undefined) metrics[key] = Number(raw);
    }
  }

  try {
    const draft = await generateThesis({
      ticker: position.ticker,
      company: stock?.company ?? position.ticker,
      sector: stock?.sector ?? position.sector,
      metrics,
    });
    return { ok: true, draft };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not draft a thesis. Try again.',
    };
  }
}

export async function submitThesis(positionId: string, input: ThesisInput): Promise<ActionResult> {
  try {
    await saveThesis(await requireUserId(), positionId, input);
    revalidatePath(`/positions/${positionId}`);
    revalidatePath('/portfolio');
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error, 'Could not save that thesis. Try again.') };
  }
}
