import type { Metadata } from 'next';
import { ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DisclaimerFooter } from '@/components/ui/disclaimer';

export const metadata: Metadata = { title: 'Decisions' };

export default function DecisionsPage() {
  return (
    <>
      <PageHeader
        title="Decisions"
        description="Every hold, trim, exit and override you have made, with the reasoning you gave at the time."
      />
      <EmptyState
        icon={ListChecks}
        title="No decisions logged"
        description="When one of your exit rules is met, the decision you make gets recorded here alongside what happened next."
      />
      <DisclaimerFooter />
    </>
  );
}
