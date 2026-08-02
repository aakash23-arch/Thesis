import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchStocks } from '@/lib/stocks/search';

// Prisma needs the Node runtime.
export const runtime = 'nodejs';

/**
 * Stock autocomplete for `StockSearch`.
 *
 * A GET route rather than a Server Action: search-as-you-type is a read, it
 * benefits from GET semantics, and an action would POST on every keystroke.
 *
 * Behind auth even though the stock universe is not secret -- an open,
 * unthrottled database query is not something to leave exposed.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get('q') ?? '';
  if (query.trim() === '') return NextResponse.json({ results: [] });

  const results = await searchStocks(query);
  return NextResponse.json({ results });
}
