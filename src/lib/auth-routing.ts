export const LOGIN_PATH = '/login';
export const ONBOARDING_PATH = '/onboarding';
export const HOME_PATH = '/';

/**
 * Routes reachable without a session. Everything else in the app requires one.
 * `/styleguide` is here because it is a static design surface with no user data
 * on it -- it must stay viewable while auth is being worked on.
 */
export const PUBLIC_PATHS = [LOGIN_PATH, '/styleguide'] as const;

/**
 * Paths the route guard never touches.
 *
 * All of `/api` is excluded, not just the auth callbacks: an API route that
 * answers a fetch with a 307 to an HTML login page is useless to the caller.
 * Routes authenticate themselves and return a proper 401 instead -- see
 * `src/app/api/stocks/search/route.ts`.
 */
const IGNORED_PREFIXES = ['/api', '/_next', '/static'] as const;

export interface RouteState {
  pathname: string;
  isAuthenticated: boolean;
  /** Whether the user has completed onboarding. Meaningless when signed out. */
  isOnboarded: boolean;
}

function isIgnored(pathname: string): boolean {
  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  // Any path with a file extension is an asset, not a page.
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * The whole route-protection policy, as one pure function.
 *
 * Returns the path to redirect to, or `null` to allow the request through.
 * Middleware is a thin adapter over this so the policy can be exhaustively
 * tested without booting Next -- this is the code that decides who can see
 * whose portfolio, and it should not need a browser to verify.
 */
export function resolveRedirect({
  pathname,
  isAuthenticated,
  isOnboarded,
}: RouteState): string | null {
  if (isIgnored(pathname)) return null;

  if (!isAuthenticated) {
    // Public pages are fine; everything else goes to sign-in.
    return isPublic(pathname) ? null : LOGIN_PATH;
  }

  const onOnboarding = pathname === ONBOARDING_PATH || pathname.startsWith(`${ONBOARDING_PATH}/`);

  if (!isOnboarded) {
    // Signed in but unfinished: onboarding is the only reachable page. Public
    // pages stay reachable so the styleguide and a sign-out route still work.
    if (onOnboarding || isPublic(pathname)) return null;
    return ONBOARDING_PATH;
  }

  // Finished. Sign-in and onboarding are now behind them.
  if (onOnboarding || pathname === LOGIN_PATH) return HOME_PATH;

  return null;
}
