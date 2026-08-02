import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatINR } from '@/lib/format';
import type { PositionRow } from '@/lib/positions';

/**
 * The holdings a user has entered. No last price, day change or health gauge:
 * there is no price feed and no thesis engine yet, and showing a placeholder
 * number in a money column would be worse than showing none.
 */
export function PositionsTable({ positions }: { positions: PositionRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Sector</TableHead>
          <TableHead numeric>Qty</TableHead>
          <TableHead numeric>Avg price</TableHead>
          <TableHead numeric>Invested</TableHead>
          <TableHead>Thesis</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.ticker}</TableCell>
            <TableCell className="text-ink-secondary">{p.sector ?? '—'}</TableCell>
            <TableCell numeric>{p.quantity}</TableCell>
            <TableCell numeric>{formatINR(p.avgBuyPrice, { decimals: true })}</TableCell>
            <TableCell numeric>{formatINR(p.invested)}</TableCell>
            <TableCell>
              {p.hasThesis ? (
                <Badge variant="healthy" dot>
                  Filed
                </Badge>
              ) : (
                <Badge variant="caution" dot>
                  None yet
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
