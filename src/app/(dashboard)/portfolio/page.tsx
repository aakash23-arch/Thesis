import type { Metadata } from 'next';
import { Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';

export const metadata: Metadata = { title: 'Portfolio' };

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Every position you hold, with the thesis behind it and how that thesis is faring."
      />
      <EmptyState
        icon={Wallet}
        title="No positions yet"
        description="Add your first stock to see what your thesis health looks like."
      />
      <DisclaimerFooter />
    </>
  );
}
