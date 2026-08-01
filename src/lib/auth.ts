import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';

/**
 * Whether Google OAuth is actually configured. Read at module scope but never
 * thrown on: `next build` evaluates this module while collecting page data, so
 * a hard failure here would make the build depend on runtime secrets. The login
 * page uses this to explain the situation instead of offering a button that
 * cannot work.
 */
export const isAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],

  // JWT rather than database sessions, specifically so middleware can authorise
  // on the edge without a database round trip on every request. The adapter
  // still persists users and accounts; only the session lives in the cookie.
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      // First call after sign-in: `user` comes from the adapter.
      if (user) {
        token.id = user.id;
        token.onboardedAt = (user as { onboardedAt?: Date | null }).onboardedAt ?? null;
        return token;
      }

      // Onboarding completion happens after the token was minted, so the token
      // would otherwise keep saying "not onboarded" until it expired. Re-read
      // only while it is still null -- once set, this never queries again.
      if (token.id && !token.onboardedAt) {
        const fresh = await db.user.findUnique({
          where: { id: token.id },
          select: { onboardedAt: true },
        });
        token.onboardedAt = fresh?.onboardedAt ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.onboardedAt = token.onboardedAt ?? null;
      }
      return session;
    },
  },
};
