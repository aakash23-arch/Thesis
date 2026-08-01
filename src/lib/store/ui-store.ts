'use client';

import * as React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  /** Desktop preference only. Tablet forces collapsed; mobile uses the drawer. */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Off-canvas nav, below 768px. Never persisted. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: 'thesis-ui-store',
      // The server has no localStorage, so it always renders the defaults.
      // Letting zustand rehydrate automatically would make the first client
      // render disagree with the server's HTML -- a hydration error plus a
      // visible sidebar-width jump. We rehydrate deliberately instead, and
      // useStoreHydrated() reports the server's view until it lands.
      skipHydration: true,
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);

// Kick off rehydration once per client session, at module load rather than in a
// component effect -- otherwise every mounted consumer re-reads localStorage.
if (typeof window !== 'undefined') {
  void useUiStore.persist?.rehydrate();
}

// zustand only attaches the `.persist` API when a storage backend exists, so it
// is genuinely undefined during SSR and prerendering -- reaching for it
// unguarded crashes the build. These fall back to "never hydrated", which is
// exactly the server's view of the world.
const noopUnsubscribe = () => {};
const subscribeToHydration = (onStoreChange: () => void) =>
  useUiStore.persist?.onFinishHydration(onStoreChange) ?? noopUnsubscribe;
const getHydrated = () => useUiStore.persist?.hasHydrated() ?? false;
const getServerHydrated = () => false;

/**
 * True once the persisted store has been read back from localStorage.
 *
 * React uses `getServerSnapshot` for SSR and for the hydration pass, then reads
 * the live snapshot and re-renders -- so consumers render the server's defaults
 * first and the restored preference immediately after, with no mismatch.
 */
export function useStoreHydrated(): boolean {
  return React.useSyncExternalStore(subscribeToHydration, getHydrated, getServerHydrated);
}
