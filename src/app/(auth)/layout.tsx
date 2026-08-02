import { DisclaimerFooter } from '@/components/ui/disclaimer';

/**
 * Deliberately without the sidebar shell -- these screens come before the app.
 * A single centred column, closer to a title page than a dashboard.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page px-4 py-10 lg:px-6">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
        {children}
      </main>
      <div className="mx-auto w-full max-w-xl">
        <DisclaimerFooter />
      </div>
    </div>
  );
}
