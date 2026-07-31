'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ScanSearch,
  Rocket,
  Gauge,
  ListChecks,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/store/ui-store';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/xray', label: 'X-Ray', icon: ScanSearch },
  { href: '/ipo', label: 'IPOs', icon: Rocket },
  { href: '/dqs', label: 'DQS', icon: Gauge },
  { href: '/decisions', label: 'Decisions', icon: ListChecks },
];

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col justify-between bg-ink-primary text-white transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div>
        <div className="flex h-16 items-center px-4">
          {!collapsed && <span className="font-serif text-xl">Thesis</span>}
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-card px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white',
                  active && 'bg-white/10 text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1 px-2 pb-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-card px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 rounded-card px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
