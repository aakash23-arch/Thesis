import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Wallet } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { listPositions, summarise } from '@/lib/positions';
import { formatINR } from '@/lib/format';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat-tile';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';
import { PositionsTable } from '@/components/positions/positions-table';

export const metadata: Metadata = { title: 'Portfolio' };

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const positions = await listPositions(session.user.id);
  const { positionCount, investedTotal } = summarise(positions);

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Every position you hold, with the thesis behind it and how that thesis is faring."
      />

      {positionCount === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No positions yet"
          description="Add your first stock to see what your thesis health looks like."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatTile label="Positions" value={String(positionCount)} />
            <StatTile
              label="Invested"
              value={formatINR(investedTotal)}
              hint="At cost. Live prices arrive shortly."
            />
          </div>
          <Card padded={false}>
            <PositionsTable positions={positions} />
          </Card>
        </div>
      )}

      <DisclaimerFooter />
    </>
  );
}
