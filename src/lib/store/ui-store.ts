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
      // The server has no localStorage, so it always renders the default. Letting
      // zustand rehydrate during module init would make the first client render
      // disagree with the server's HTML -- a hydration error plus a visible
      // sidebar-width jump. Instead we rehydrate deliberately, after mount.
      skipHydration: true,
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);

/**
 * True once the persisted store has been read from localStorage. Render the
 * server-side defaults until this flips, then the restored preference.
 */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    void useUiStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
