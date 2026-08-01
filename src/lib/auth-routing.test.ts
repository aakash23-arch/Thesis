import { describe, expect, it } from 'vitest';
import { HOME_PATH, LOGIN_PATH, ONBOARDING_PATH, resolveRedirect } from './auth-routing';

const signedOut = { isAuthenticated: false, isOnboarded: false };
const midOnboarding = { isAuthenticated: true, isOnboarded: false };
const fullMember = { isAuthenticated: true, isOnboarded: true };

const at = (pathname: string, state: Omit<Parameters<typeof resolveRedirect>[0], 'pathname'>) =>
  resolveRedirect({ pathname, ...state });

describe('signed out', () => {
  it.each(['/', '/portfolio', '/xray', '/ipo', '/dqs', '/decisions', '/settings'])(
    'sends %s to sign-in',
    (pathname) => {
      expect(at(pathname, signedOut)).toBe(LOGIN_PATH);
    },
  );

  it('allows the login page itself, so there is no redirect loop', () => {
    expect(at(LOGIN_PATH, signedOut)).toBeNull();
  });

  it('allows the styleguide', () => {
    expect(at('/styleguide', signedOut)).toBeNull();
  });

  it('sends onboarding to sign-in -- there is no user to onboard', () => {
    expect(at(ONBOARDING_PATH, signedOut)).toBe(LOGIN_PATH);
  });
});

describe('signed in, onboarding unfinished', () => {
  it.each(['/', '/portfolio', '/settings'])('pulls %s back to onboarding', (pathname) => {
    expect(at(pathname, midOnboarding)).toBe(ONBOARDING_PATH);
  });

  it('allows onboarding itself, including its steps', () => {
    expect(at(ONBOARDING_PATH, midOnboarding)).toBeNull();
    expect(at(`${ONBOARDING_PATH}/anything`, midOnboarding)).toBeNull();
  });

  it('still allows public pages', () => {
    expect(at('/styleguide', midOnboarding)).toBeNull();
    expect(at(LOGIN_PATH, midOnboarding)).toBeNull();
  });
});

describe('signed in and onboarded', () => {
  it.each(['/', '/portfolio', '/xray', '/settings'])('allows %s', (pathname) => {
    expect(at(pathname, fullMember)).toBeNull();
  });

  it('bounces away from onboarding -- it is done', () => {
    expect(at(ONBOARDING_PATH, fullMember)).toBe(HOME_PATH);
  });

  it('bounces away from the login page', () => {
    expect(at(LOGIN_PATH, fullMember)).toBe(HOME_PATH);
  });
});

describe('paths middleware must never touch', () => {
  // Redirecting the auth callback would make signing in impossible.
  it.each(['/api/auth/callback/google', '/api/auth/session', '/api/auth/signin'])(
    'ignores %s even when signed out',
    (pathname) => {
      expect(at(pathname, signedOut)).toBeNull();
    },
  );

  it.each(['/_next/static/chunk.js', '/favicon.ico', '/og-image.png', '/robots.txt'])(
    'ignores the asset %s',
    (pathname) => {
      expect(at(pathname, signedOut)).toBeNull();
    },
  );

  it('does not mistake a page path for an asset', () => {
    expect(at('/portfolio', signedOut)).toBe(LOGIN_PATH);
  });
});

describe('redirect targets are terminal', () => {
  // Every redirect must land somewhere that does not itself redirect, or the
  // browser loops.
  it('login is stable for a signed-out visitor', () => {
    expect(at(LOGIN_PATH, signedOut)).toBeNull();
  });

  it('onboarding is stable for an unfinished user', () => {
    expect(at(ONBOARDING_PATH, midOnboarding)).toBeNull();
  });

  it('home is stable for a finished user', () => {
    expect(at(HOME_PATH, fullMember)).toBeNull();
  });
});
