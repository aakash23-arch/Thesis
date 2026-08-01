import type { Metadata } from 'next';
import { Rocket } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';

export const metadata: Metadata = { title: 'IPOs' };

export default function IpoPage() {
  return (
    <>
      <PageHeader
        title="IPOs"
        description="Forensic reads on upcoming issues, drawn from the DRHP and compared against listed peers."
      />
      <EmptyState
        icon={Rocket}
        title="No IPOs tracked"
        description="Open issues and their forensic reports will appear here."
      />
      <DisclaimerFooter>
        This is data analysis, not a recommendation to apply or avoid. Figures are extracted from
        public filings and carry a confidence label at the point of use.
      </DisclaimerFooter>
    </>
  );
}
