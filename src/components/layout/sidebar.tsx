'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Rocket,
  ScanSearch,
  Settings,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStoreHydrated, useUiStore } from '@/lib/store/ui-store';
import { useIsDesktop } from '@/lib/hooks/use-media-query';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/modal';
import { SimpleTooltip } from '@/components/ui/tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/xray', label: 'X-Ray', icon: ScanSearch },
  { href: '/ipo', label: 'IPOs', icon: Rocket },
  { href: '/dqs', label: 'DQS', icon: Gauge },
  { href: '/decisions', label: 'Decisions', icon: ListChecks },
];

const SETTINGS_ITEM: NavItem = { href: '/settings', label: 'Settings', icon: Settings };

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

/**
 * Label visibility, expressed purely in CSS so the server and client always
 * agree and nothing flashes on load:
 *
 * - `drawer`: always shown (mobile off-canvas nav).
 * - `rail` + expanded: hidden below 1024 (tablet rail is icon-only), shown at 1024+.
 * - `rail` + collapsed: hidden at every width.
 *
 * `sr-only` rather than `hidden` keeps the label in the accessibility tree, so
 * an icon-only rail still announces its destinations.
 */
function labelClasses(mode: 'drawer' | 'rail', collapsed: boolean) {
  if (mode === 'drawer') return '';
  return collapsed ? 'sr-only' : 'sr-only lg:not-sr-only';
}

function itemLayoutClasses(mode: 'drawer' | 'rail', collapsed: boolean) {
  if (mode === 'drawer') return 'gap-3 px-3';
  return collapsed ? 'justify-center' : 'justify-center lg:justify-start lg:gap-3 lg:px-3';
}

interface NavLinkProps {
  item: NavItem;
  active: boolean;
  mode: 'drawer' | 'rail';
  collapsed: boolean;
  /** Only meaningful once the label is actually hidden -- computed after mount. */
  tooltip: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, active, mode, collapsed, tooltip, onNavigate }: NavLinkProps) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'focus-ring-dark relative flex items-center rounded-card py-2 text-sm text-white/70 transition-colors duration-instrument hover:bg-white/10 hover:text-white',
        itemLayoutClasses(mode, collapsed),
        active && 'bg-white/10 text-white',
      )}
    >
      {/* Etched rule marks the active item -- a graduation on the rail rather
          than a filled pill. */}
      {active && (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent" aria-hidden />
      )}
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className={labelClasses(mode, collapsed)}>{item.label}</span>
    </Link>
  );

  return (
    <SimpleTooltip content={item.label} side="right" disabled={!tooltip}>
      {link}
    </SimpleTooltip>
  );
}

/** The mark survives collapse; the wordmark does not. */
function Wordmark({ mode, collapsed }: { mode: 'drawer' | 'rail'; collapsed: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        'focus-ring-dark flex h-16 items-center gap-2 rounded-card text-white',
        mode === 'drawer' ? 'px-4' : 'justify-center lg:justify-start lg:px-4',
        collapsed && 'lg:justify-center lg:px-0',
      )}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/30 font-serif text-sm leading-none"
        aria-hidden
      >
        T
      </span>
      <span className={cn('font-serif text-xl', labelClasses(mode, collapsed))}>Thesis</span>
    </Link>
  );
}

interface SidebarNavProps {
  pathname: string;
  mode: 'drawer' | 'rail';
  collapsed: boolean;
  tooltip: boolean;
  onNavigate?: () => void;
}

function SidebarNav({ pathname, mode, collapsed, tooltip, onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 px-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isActive(pathname, item.href)}
          mode={mode}
          collapsed={collapsed}
          tooltip={tooltip}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  // Reads the persisted collapse preference after mount. Until then the store
  // holds its defaults -- exactly what the server rendered.
  const hydrated = useStoreHydrated();

  // Used only to decide whether a tooltip would be redundant, never to drive
  // layout: media-query state is false on the first client render, so using it
  // for visuals would flash. Layout stays in CSS; this only gates a hover
  // affordance that cannot appear before mount anyway.
  const isDesktop = useIsDesktop();
  const railTooltips = hydrated && (collapsed || !isDesktop);

  return (
    <>
      {/*
        Desktop and tablet rail. Visibility and width are CSS-driven, so there is
        nothing for hydration to disagree about: hidden below 768, 64px at
        tablet, 240px at desktop unless the user collapsed it.
      */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col justify-between bg-ink-primary text-white transition-[width] duration-200 md:flex',
          collapsed ? 'md:w-16' : 'md:w-16 lg:w-60',
        )}
      >
        <div>
          <Wordmark mode="rail" collapsed={collapsed} />
          <SidebarNav
            pathname={pathname}
            mode="rail"
            collapsed={collapsed}
            tooltip={railTooltips}
          />
        </div>

        <div className="flex flex-col gap-1 px-2 pb-4">
          <NavLink
            item={SETTINGS_ITEM}
            active={isActive(pathname, SETTINGS_ITEM.href)}
            mode="rail"
            collapsed={collapsed}
            tooltip={railTooltips}
          />

          {/* Collapsing only has meaning at desktop width -- the tablet rail is
              already at its minimum. */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'focus-ring-dark hidden items-center rounded-card py-2 text-sm text-white/70 transition-colors duration-instrument hover:bg-white/10 hover:text-white lg:flex',
              collapsed ? 'lg:justify-center' : 'lg:gap-3 lg:px-3',
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" aria-hidden />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile: the same rail as an off-canvas drawer. */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          hideClose
          className="w-64 border-r-0 bg-ink-primary p-0 text-white md:hidden"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center justify-between pr-2">
            <Wordmark mode="drawer" collapsed={false} />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="focus-ring-dark rounded-card p-2 text-white/70 transition-colors duration-instrument hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-y-auto pb-4">
            <SidebarNav
              pathname={pathname}
              mode="drawer"
              collapsed={false}
              tooltip={false}
              onNavigate={() => setMobileNavOpen(false)}
            />
            <div className="px-2 pt-4">
              <NavLink
                item={SETTINGS_ITEM}
                active={isActive(pathname, SETTINGS_ITEM.href)}
                mode="drawer"
                collapsed={false}
                tooltip={false}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
