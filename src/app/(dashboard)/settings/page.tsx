import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Profile, notifications, data and privacy." />
      <EmptyState
        icon={Settings}
        title="Settings arrive with accounts"
        description="Profile and notification preferences become editable once sign-in is wired up."
      />
    </>
  );
}
