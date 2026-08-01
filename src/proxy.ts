import { NextResponse } from 'next/server';
import withAuth from 'next-auth/middleware';
import { resolveRedirect } from '@/lib/auth-routing';

/**
 * A thin adapter over `resolveRedirect`. All of the policy -- and all of its
 * tests -- live in `src/lib/auth-routing.ts`; this file only translates a
 * request into that function's inputs and its answer into a response.
 *
 * Named `proxy.ts`: Next 16 deprecated the `middleware` file convention in
 * favour of `proxy`. The API is otherwise unchanged.
 */
export default withAuth(
  function proxy(req) {
    const { token } = req.nextauth;

    const redirect = resolveRedirect({
      pathname: req.nextUrl.pathname,
      isAuthenticated: Boolean(token),
      isOnboarded: Boolean(token?.onboardedAt),
    });

    if (redirect && redirect !== req.nextUrl.pathname) {
      return NextResponse.redirect(new URL(redirect, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // We own the policy, so withAuth must never redirect on its own -- doing
      // so would bypass resolveRedirect and split the rules across two files.
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: [
    // Everything except auth callbacks, Next internals and files with an
    // extension. resolveRedirect re-checks these, but keeping them out of the
    // matcher avoids running middleware on every static asset.
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
