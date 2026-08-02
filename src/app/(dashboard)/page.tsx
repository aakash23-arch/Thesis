import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Plus, Wallet } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { listPositions, summarise } from '@/lib/positions';
import { formatINR } from '@/lib/format';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat-tile';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';
import { PositionsTable } from '@/components/positions/positions-table';

/** Em dash: the figure exists as a slot, there is just nothing in it yet. */
const NO_DATA = '—';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const positions = await listPositions(session.user.id);
  const { positionCount, investedTotal, withThesis } = summarise(positions);
  const empty = positionCount === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your positions, the theses behind them, and whether those theses still hold."
        action={
          <Button asChild>
            <Link href="/portfolio">
              <Plus className="h-4 w-4" aria-hidden />
              Add position
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          label="Invested"
          value={empty ? NO_DATA : formatINR(investedTotal)}
          hint={empty ? 'Add a position to begin' : 'At cost. Live prices arrive shortly.'}
        />
        <StatTile
          label="Thesis coverage"
          value={empty ? NO_DATA : `${withThesis} / ${positionCount}`}
          hint="Positions with a filed thesis"
        />
        <StatTile
          label="Decision Quality Score"
          value={NO_DATA}
          hint="Unlocks after your first thesis"
        />
      </div>

      <div className="mt-8">
        {empty ? (
          <EmptyState
            icon={Wallet}
            title="No positions yet"
            description="Add your first stock to see what your thesis health looks like."
            action={
              <Button asChild variant="secondary">
                <Link href="/portfolio">
                  <Plus className="h-4 w-4" aria-hidden />
                  Add your first position
                </Link>
              </Button>
            }
          />
        ) : (
          <Card padded={false}>
            <div className="p-6 pb-0">
              <CardHeader className="mb-0">
                <CardTitle>Holdings</CardTitle>
                <CardDescription>
                  {positionCount === 1 ? '1 position' : `${positionCount} positions`}. Give each one
                  a thesis and Thesis can start watching it for you.
                </CardDescription>
              </CardHeader>
            </div>
            <div className="mt-4">
              <PositionsTable positions={positions} />
            </div>
          </Card>
        )}
      </div>

      <DisclaimerFooter />
    </>
  );
}
