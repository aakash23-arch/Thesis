import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowLeft } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { listPositions } from '@/lib/positions';
import { getThesisForPosition } from '@/lib/thesis';
import { isLlmConfigured } from '@/lib/llm';
import { formatINR, formatSignedPercent } from '@/lib/format';
import type { MetricKey } from '@/lib/metrics';
import { PageHeader } from '@/components/layout/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { DisclaimerFooter } from '@/components/ui/disclaimer';
import { ThesisPanel } from '@/components/thesis/thesis-panel';

export const metadata: Metadata = { title: 'Position' };

const COLUMN_TO_METRIC: [string, MetricKey][] = [
  ['trailingPe', 'trailing_pe'],
  ['priceToBook', 'price_to_book'],
  ['revenueGrowthYoy', 'revenue_growth_yoy'],
  ['profitMargin', 'profit_margin'],
  ['returnOnEquity', 'return_on_equity'],
  ['debtToEquity', 'debt_to_equity'],
  ['dividendYield', 'dividend_yield'],
];

export default async function PositionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;

  // Reuse listPositions so the figures here and in the table can never disagree.
  const position = (await listPositions(session.user.id)).find((p) => p.id === id);
  if (!position) notFound();

  const stock = await db.stock.findFirst({
    where: { ticker: position.ticker, exchange: position.exchange },
    select: { fundamentals: true },
  });

  const currentMetrics: Partial<Record<MetricKey, number>> = {};
  if (stock?.fundamentals) {
    const f = stock.fundamentals as unknown as Record<string, unknown>;
    for (const [column, key] of COLUMN_TO_METRIC) {
      const raw = f[column];
      if (raw !== null && raw !== undefined) currentMetrics[key] = Number(raw);
    }
  }

  const thesis = await getThesisForPosition(session.user.id, id);

  return (
    <>
      <Link
        href="/portfolio"
        className="focus-ring mb-4 inline-flex items-center gap-1.5 rounded text-caption normal-case tracking-normal text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Portfolio
      </Link>

      <PageHeader
        eyebrow={position.sector ?? undefined}
        title={position.company ?? position.ticker}
        description={`${position.ticker} · ${position.exchange} · ${position.quantity} shares at ${formatINR(position.avgBuyPrice, { decimals: true })}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Market value"
          value={position.marketValue === null ? '—' : formatINR(position.marketValue)}
        />
        <StatTile label="Invested" value={formatINR(position.invested)} hint="At cost" />
        <StatTile
          label="Unrealised gain"
          value={position.gain === null ? '—' : formatINR(position.gain)}
          delta={
            position.gainPercent === null
              ? undefined
              : {
                  value: formatSignedPercent(position.gainPercent),
                  direction: position.gainPercent >= 0 ? 'up' : 'down',
                }
          }
        />
        <StatTile
          label="Last price"
          value={
            position.lastPrice === null ? '—' : formatINR(position.lastPrice, { decimals: true })
          }
          delta={
            position.dayChangePercent === null
              ? undefined
              : {
                  value: formatSignedPercent(position.dayChangePercent),
                  direction: position.dayChangePercent >= 0 ? 'up' : 'down',
                }
          }
        />
      </div>

      <div className="mt-8">
        <ThesisPanel
          positionId={position.id}
          ticker={position.ticker}
          sector={position.sector}
          currentMetrics={currentMetrics}
          canGenerate={isLlmConfigured}
          thesis={thesis}
          now={new Date().toISOString()}
        />
      </div>

      <DisclaimerFooter />
    </>
  );
}
