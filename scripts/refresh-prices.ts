import { db } from '../src/lib/db';
import { refreshPrices } from '../src/lib/prices/refresh';
import { refreshFundamentals } from '../src/lib/prices/fundamentals';

/**
 * On-demand price refresh. Scheduling lands in Session 8 alongside deployment;
 * until then this is the thing you run, and the thing a scheduler will call.
 */
async function main() {
  const args = process.argv.slice(2);
  // `--fundamentals` also refreshes company metrics. Separate because it is far
  // slower and rate-limits harder, so it belongs on a different schedule.
  const withFundamentals = args.includes('--fundamentals');
  const tickers = args.filter((a) => !a.startsWith('--'));
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

  if (!withFundamentals) return;

  console.log('\nFetching fundamentals (slower -- quoteSummary rate-limits)...');
  const f = await refreshFundamentals(tickers.length ? tickers : undefined);
  console.log(
    `[fundamentals] requested ${f.requested}, updated ${f.updated}, failed ${f.failed.length}`,
  );
  for (const failure of f.failed) {
    console.warn(`  ${failure.ticker}: ${failure.reason}`);
  }
}

main()
  .catch((error) => {
    console.error('Refresh failed:', error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
