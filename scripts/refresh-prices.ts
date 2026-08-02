import { db } from '../src/lib/db';
import { refreshPrices } from '../src/lib/prices/refresh';

/**
 * On-demand price refresh. Scheduling lands in Session 8 alongside deployment;
 * until then this is the thing you run, and the thing a scheduler will call.
 */
async function main() {
  const tickers = process.argv.slice(2);
  const summary = await refreshPrices(tickers.length ? tickers : undefined);

  console.log(
    `[${summary.provider}] requested ${summary.requested}, updated ${summary.updated}, failed ${summary.failed.length}`,
  );

  for (const failure of summary.failed) {
    console.warn(`  ${failure.ticker}: ${failure.reason}`);
  }

  // A total wipeout means the provider is down or blocking, which a scheduler
  // should notice. Partial failures are normal and stay quiet.
  if (summary.requested > 0 && summary.updated === 0) {
    console.error('No prices updated at all -- provider may be unreachable.');
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Refresh failed:', error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
