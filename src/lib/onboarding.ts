import { z } from 'zod';
import { db } from '@/lib/db';
import { findStock } from '@/lib/stocks/search';

/**
 * Onboarding logic, kept as plain functions taking a userId.
 *
 * Server Actions call these but hold no logic themselves: the build plan
 * anticipates a FastAPI backend in Phase 3, and Server Actions are the one
 * thing that cannot port. Everything here can.
 */

export const investsInSchema = z.enum(['STOCKS', 'MUTUAL_FUNDS', 'BOTH']);
export const tracksWithSchema = z.enum(['SPREADSHEET', 'BROKER_APP', 'NOTHING', 'OTHER']);

export const firstPositionSchema = z.object({
  ticker: z.string().min(1, 'Choose a stock.'),
  exchange: z.enum(['NSE', 'BSE']),
  quantity: z.coerce.number().positive('Quantity must be more than zero.'),
  avgBuyPrice: z.coerce.number().positive('Average price must be more than zero.'),
  buyDate: z.coerce
    .date()
    .max(new Date(), 'Buy date cannot be in the future.')
    .refine((d) => d.getFullYear() >= 1990, 'Buy date looks too far in the past.'),
});

/**
 * What actually crosses the wire from a form: strings. Declared explicitly
 * rather than via `z.input`, because Zod 3's `coerce` reports the *output* type
 * as its input, which would wrongly demand numbers and a Date here.
 */
export interface FirstPositionInput {
  ticker: string;
  exchange: 'NSE' | 'BSE';
  quantity: string | number;
  avgBuyPrice: string | number;
  buyDate: string | Date;
}

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
