import { PrismaClient } from '@prisma/client';
import { NIFTY_50 } from '../src/lib/stocks/nifty50';

const db = new PrismaClient();

/**
 * Seeds the tradable universe. Idempotent: reference data is upserted and
 * prices are left alone, so re-running never wipes a fresh price fetch.
 */
async function main() {
  let created = 0;
  let updated = 0;

  for (const stock of NIFTY_50) {
    const result = await db.stock.upsert({
      where: { ticker_exchange: { ticker: stock.ticker, exchange: stock.exchange } },
      create: {
        ticker: stock.ticker,
        exchange: stock.exchange,
        company: stock.company,
        sector: stock.sector,
      },
      // Reference data only -- never touch lastPrice/previousClose here.
      update: { company: stock.company, sector: stock.sector },
      select: { createdAt: true, updatedAt: true },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) created += 1;
    else updated += 1;
  }

  const total = await db.stock.count();
  console.log(`Seeded stocks: ${created} created, ${updated} unchanged/updated, ${total} total.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
