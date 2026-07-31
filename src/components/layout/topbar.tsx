import { Bell, Search } from 'lucide-react';

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex w-full max-w-sm items-center gap-2 rounded-card border border-border bg-page px-3 py-1.5 text-ink-tertiary">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Search positions, IPOs..."
          className="w-full bg-transparent text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-card text-ink-secondary hover:bg-recessed"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-8 w-8 rounded-full bg-recessed" aria-hidden />
      </div>
    </header>
  );
}
