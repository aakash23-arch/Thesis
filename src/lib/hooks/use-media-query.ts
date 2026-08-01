'use client';

import * as React from 'react';

/**
 * SSR-safe media query, built on useSyncExternalStore -- the primitive React
 * provides for exactly this shape of problem. React reads `getServerSnapshot`
 * during SSR and hydration, then switches to the live value, so the server's
 * markup and React's first client render always agree without a setState in an
 * effect (which would cascade renders under concurrent rendering).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = React.useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = React.useCallback(() => false, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Breakpoints per the design spec: desktop >=1024, tablet 768-1023, mobile <768.
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
