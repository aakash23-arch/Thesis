import { db } from '@/lib/db';

export interface PositionRow {
  id: string;
  ticker: string;
  exchange: string;
  sector: string | null;
  quantity: number;
  avgBuyPrice: number;
  buyDate: Date;
  /** Cost basis. Not market value -- there is no price feed until Session 3. */
  invested: number;
  hasThesis: boolean;
}

/**
 * Positions for a user, with Decimal columns converted to numbers at the
 * boundary so nothing downstream has to know Prisma's Decimal type.
 *
 * Deliberately no market value or P&L: there is no price data yet, and an
 * invented number is worse than an absent one.
 */
export async function listPositions(userId: string): Promise<PositionRow[]> {
  const rows = await db.position.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ticker: true,
      exchange: true,
      sector: true,
      quantity: true,
      avgBuyPrice: true,
      buyDate: true,
      _count: { select: { theses: true } },
    },
  });

  return rows.map((r) => {
    const quantity = Number(r.quantity);
    const avgBuyPrice = Number(r.avgBuyPrice);
    return {
      id: r.id,
      ticker: r.ticker,
      exchange: r.exchange,
      sector: r.sector,
      quantity,
      avgBuyPrice,
      buyDate: r.buyDate,
      invested: quantity * avgBuyPrice,
      hasThesis: r._count.theses > 0,
    };
  });
}

export interface PortfolioSummary {
  positionCount: number;
  investedTotal: number;
  withThesis: number;
}

export function summarise(positions: PositionRow[]): PortfolioSummary {
  return {
    positionCount: positions.length,
    investedTotal: positions.reduce((sum, p) => sum + p.invested, 0),
    withThesis: positions.filter((p) => p.hasThesis).length,
  };
}
