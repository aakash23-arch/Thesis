import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      {/* First focusable element on the page -- visible only when focused. */}
      <a
        href="#main"
        className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:border focus:border-border-strong focus:bg-surface focus:px-4 focus:py-2 focus:text-body focus:text-ink-primary"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen bg-page">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          {/* Spec: 16px base padding, 24px gutters at desktop width. */}
          <main id="main" className="flex-1 px-4 py-8 lg:px-6">
            <div className="mx-auto max-w-content">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
