import type { Metadata } from 'next';
import { Gauge } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';

export const metadata: Metadata = { title: 'DQS' };

export default function DqsPage() {
  return (
    <>
      <PageHeader
        title="Decision Quality Score"
        description="How rigorously you build theses, construct the portfolio, hold to your exit rules, and adapt."
      />
      <EmptyState
        icon={Gauge}
        title="Not enough to score yet"
        description="Your DQS needs a few positions with theses behind them before it says anything meaningful."
      />
      <DisclaimerFooter />
    </>
  );
}
