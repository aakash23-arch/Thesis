import { z } from 'zod';
import { db } from '@/lib/db';
import { findStock } from '@/lib/stocks/search';
import { positionInputSchema, type PositionInput } from '@/lib/positions';

/**
 * Onboarding logic, kept as plain functions taking a userId.
 *
 * Server Actions call these but hold no logic themselves: the build plan
 * anticipates a FastAPI backend in Phase 3, and Server Actions are the one
 * thing that cannot port. Everything here can.
 */

export const investsInSchema = z.enum(['STOCKS', 'MUTUAL_FUNDS', 'BOTH']);
export const tracksWithSchema = z.enum(['SPREADSHEET', 'BROKER_APP', 'NOTHING', 'OTHER']);

// The position shape is shared with the portfolio's add form, so onboarding and
// the main app can never validate a holding differently.
export const firstPositionSchema = positionInputSchema;
export type FirstPositionInput = PositionInput;

export async function saveInvestsIn(userId: string, value: unknown): Promise<void> {
  const investsIn = investsInSchema.parse(value);
  await db.user.update({ where: { id: userId }, data: { investsIn } });
}

export async function saveTracksWith(userId: string, value: unknown): Promise<void> {
  const tracksWith = tracksWithSchema.parse(value);
  await db.user.update({ where: { id: userId }, data: { tracksWith } });
}

/**
 * Marks onboarding finished, optionally creating the first position in the same
 * transaction so a failed position insert cannot leave someone "onboarded" with
 * nothing to show for it.
 */
export async function completeOnboarding(
  userId: string,
  position?: FirstPositionInput,
): Promise<void> {
  if (!position) {
    await db.user.update({ where: { id: userId }, data: { onboardedAt: new Date() } });
    return;
  }

  const parsed = firstPositionSchema.parse(position);

  // Never trust a ticker off the wire -- resolve it against the known universe
  // so `sector` is ours, not the client's.
  const stock = await findStock(parsed.ticker, parsed.exchange);
  if (!stock) {
    throw new Error(`Unknown ticker: ${parsed.ticker}`);
  }

  await db.$transaction([
    db.position.create({
      data: {
        userId,
        ticker: stock.ticker,
        exchange: stock.exchange,
        assetType: 'STOCK',
        quantity: parsed.quantity,
        avgBuyPrice: parsed.avgBuyPrice,
        buyDate: parsed.buyDate,
        sector: stock.sector,
      },
    }),
    db.user.update({ where: { id: userId }, data: { onboardedAt: new Date() } }),
  ]);
}

export async function updateDisplayName(userId: string, value: unknown): Promise<void> {
  const name = z.string().trim().min(1, 'Name cannot be empty.').max(80).parse(value);
  await db.user.update({ where: { id: userId }, data: { name } });
}
