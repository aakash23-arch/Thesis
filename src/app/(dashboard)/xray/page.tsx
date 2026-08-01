import type { Metadata } from 'next';
import { ScanSearch } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';

export const metadata: Metadata = { title: 'X-Ray' };

export default function XRayPage() {
  return (
    <>
      <PageHeader
        title="Portfolio X-Ray"
        description="Look through your mutual funds to the companies underneath, and see what you actually own."
      />
      <EmptyState
        icon={ScanSearch}
        title="Nothing to X-Ray yet"
        description="Once you hold both stocks and mutual funds, this shows your true company and sector exposure across all of them."
      />
      <DisclaimerFooter />
    </>
  );
}
