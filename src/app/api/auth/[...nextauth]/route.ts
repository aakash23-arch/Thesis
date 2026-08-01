import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Prisma needs the Node runtime; the adapter cannot run on edge.
export const runtime = 'nodejs';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
