import { Plus, Wallet } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { StatTile } from '@/components/ui/stat-tile';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';

/** Em dash: the figure exists as a slot, there is just nothing in it yet. */
const NO_DATA = '—';

/**
 * The dashboard before there is anything to show. Real figures land in Session 3
 * (positions) and Session 6 (DQS); until then the tiles hold their shape so the
 * page reads as a document waiting for data, not as a broken screen.
 */
export default function DashboardPage() {
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
        <StatTile label="Portfolio value" value={NO_DATA} hint="Add a position to begin" />
        <StatTile label="Thesis coverage" value={NO_DATA} hint="Positions with a filed thesis" />
        <StatTile
          label="Decision Quality Score"
          value={NO_DATA}
          hint="Unlocks after your first thesis"
        />
      </div>

      <div className="mt-8">
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
      </div>

      <DisclaimerFooter />
    </>
  );
}
