import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Wallet } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { listPositions, sectorBreakdown, summarise } from '@/lib/positions';
import { formatINR, formatSignedPercent } from '@/lib/format';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat-tile';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';
import { PositionsTable } from '@/components/positions/positions-table';
import { AddPositionModal } from '@/components/positions/add-position-modal';
import { SectorBar } from '@/components/positions/sector-bar';
import { PriceNote } from '@/components/positions/price-note';

export const metadata: Metadata = { title: 'Portfolio' };

const NO_DATA = '—';

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const positions = await listPositions(session.user.id);
  const summary = summarise(positions);
  const sectors = sectorBreakdown(positions);

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Every position you hold, with the thesis behind it and how that thesis is faring."
        action={<AddPositionModal />}
      />

      {summary.positionCount === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No positions yet"
          description="Add your first stock to see what your thesis health looks like."
          action={<AddPositionModal triggerLabel="Add your first position" />}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Market value"
              value={
                summary.marketValueTotal === null ? NO_DATA : formatINR(summary.marketValueTotal)
              }
            />
            <StatTile label="Invested" value={formatINR(summary.investedTotal)} hint="At cost" />
            <StatTile
              label="Unrealised gain"
              value={summary.gainTotal === null ? NO_DATA : formatINR(summary.gainTotal)}
              delta={
                summary.gainPercent === null
                  ? undefined
                  : {
                      value: formatSignedPercent(summary.gainPercent),
                      direction: summary.gainPercent >= 0 ? 'up' : 'down',
                    }
              }
            />
            <StatTile
              label="Day change"
              value={summary.dayChangeTotal === null ? NO_DATA : formatINR(summary.dayChangeTotal)}
              delta={
                summary.dayChangePercent === null
                  ? undefined
                  : {
                      value: formatSignedPercent(summary.dayChangePercent),
                      direction: summary.dayChangePercent >= 0 ? 'up' : 'down',
                    }
              }
            />
          </div>

          <PriceNote
            pricedAsOf={summary.pricedAsOf}
            stale={summary.pricesStale}
            unpricedCount={summary.unpricedCount}
          />

          {sectors.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Sector exposure</CardTitle>
                <CardDescription>
                  Where your money actually sits. Concentration is easier to miss than to fix.
                </CardDescription>
              </CardHeader>
              <SectorBar slices={sectors} />
            </Card>
          )}

          <Card padded={false}>
            <PositionsTable positions={positions} />
          </Card>
        </div>
      )}

      <DisclaimerFooter />
    </>
  );
}
