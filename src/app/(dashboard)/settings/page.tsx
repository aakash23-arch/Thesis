import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/settings/profile-form';
import { SignOutButton } from '@/components/auth/sign-out-button';

export const metadata: Metadata = { title: 'Settings' };

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, plan: true },
  });

  if (!user) redirect('/login');

  return (
    <>
      <PageHeader title="Settings" description="Profile, plan, and your session." />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>How you appear inside Thesis.</CardDescription>
          </CardHeader>
          <ProfileForm initialName={user.name ?? ''} email={user.email} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>What your account currently includes.</CardDescription>
          </CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral" dot>
              {PLAN_LABELS[user.plan] ?? user.plan}
            </Badge>
            <span className="text-caption normal-case tracking-normal text-ink-tertiary">
              Billing and upgrades arrive in a later session.
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Sign out of this device.</CardDescription>
          </CardHeader>
          <SignOutButton />
        </Card>
      </div>
    </>
  );
}
