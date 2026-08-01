'use client';

import * as React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useUiStore } from '@/lib/store/ui-store';
import { Avatar, AvatarFallback, initialsOf } from '@/components/ui/avatar';
import { SimpleTooltip } from '@/components/ui/tooltip';

export interface TopbarProps {
  /** Placeholder until Session 2 wires the session user. */
  userName?: string;
  unreadCount?: number;
}

export function Topbar({ userName = 'Investor', unreadCount = 0 }: TopbarProps) {
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const searchId = React.useId();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
        className="focus-ring -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-card text-ink-secondary transition-colors duration-instrument hover:bg-recessed hover:text-ink-primary md:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>

      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-card border border-border bg-page px-3 py-1.5 transition-colors duration-instrument focus-within:border-border-strong focus-within:ring-2 focus-within:ring-border-focus sm:max-w-sm"
      >
        <Search className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden />
        <label htmlFor={searchId} className="sr-only">
          Search positions and IPOs
        </label>
        <input
          id={searchId}
          type="search"
          placeholder="Search positions, IPOs..."
          className="w-full min-w-0 bg-transparent text-body text-ink-primary placeholder:text-ink-tertiary focus:outline-none"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <SimpleTooltip content="Notifications" side="bottom">
          <button
            type="button"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-card text-ink-secondary transition-colors duration-instrument hover:bg-recessed hover:text-ink-primary"
          >
            <Bell className="h-4 w-4" aria-hidden />
            {unreadCount > 0 && (
              <span
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-broken px-1 font-mono text-[0.625rem] tabular-nums leading-none text-white"
                aria-hidden
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </SimpleTooltip>

        <Avatar>
          <AvatarFallback>{initialsOf(userName)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
