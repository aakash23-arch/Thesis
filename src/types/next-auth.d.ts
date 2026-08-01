import type { DefaultSession } from 'next-auth';

/**
 * Module augmentation so `session.user.id` and `onboardedAt` are typed rather
 * than `any`. Without this the route guard would silently accept `undefined`
 * where it expects a user id.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      /** Non-null once onboarding is complete. The guard's source of truth. */
      onboardedAt: Date | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    onboardedAt: Date | null;
  }
}
