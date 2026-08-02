import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ThesisGauge } from '@/components/thesis/thesis-gauge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatINR, formatSignedPercent } from '@/lib/format';
import type { PositionRow } from '@/lib/positions';
import { PositionRowActions } from './position-row-actions';

/** Gains take the signal ink colours; a flat or unknown figure stays neutral. */
function gainClass(value: number | null): string {
  if (value === null || value === 0) return 'text-ink-secondary';
  return value > 0 ? 'text-signal-healthy-ink' : 'text-signal-broken-ink';
}

/** An absent price is an em dash, never a zero. */
function Money({ value, className }: { value: number | null; className?: string }) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {value === null ? '—' : formatINR(value)}
    </span>
  );
}

export function PositionsTable({ positions }: { positions: PositionRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Sector</TableHead>
          <TableHead numeric>Qty</TableHead>
          <TableHead numeric>Avg price</TableHead>
          <TableHead numeric>LTP</TableHead>
          <TableHead numeric>Value</TableHead>
          <TableHead numeric>Gain</TableHead>
          <TableHead>Thesis</TableHead>
          <TableHead numeric>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">
              <Link
                href={`/positions/${p.id}`}
                className="focus-ring rounded underline-offset-4 hover:underline"
              >
                {p.ticker}
              </Link>
              {p.company && (
                <span className="ml-2 hidden text-caption normal-case tracking-normal text-ink-tertiary lg:inline">
                  {p.company}
                </span>
              )}
            </TableCell>
            <TableCell className="text-ink-secondary">{p.sector ?? '—'}</TableCell>
            <TableCell numeric>{p.quantity}</TableCell>
            <TableCell numeric>{formatINR(p.avgBuyPrice, { decimals: true })}</TableCell>
            <TableCell numeric>
              {p.lastPrice === null ? (
                <span className="text-ink-tertiary">—</span>
              ) : (
                <span className="font-mono tabular-nums">
                  {formatINR(p.lastPrice, { decimals: true })}
                </span>
              )}
            </TableCell>
            <TableCell numeric>
              <Money value={p.marketValue} />
            </TableCell>
            <TableCell numeric>
              <span className={cn('font-mono tabular-nums', gainClass(p.gain))}>
                {p.gain === null ? (
                  '—'
                ) : (
                  <>
                    {p.gain >= 0 ? '+' : '-'}
                    {formatINR(Math.abs(p.gain))}
                    <span className="ml-1 text-caption">
                      {p.gainPercent === null ? '' : `(${formatSignedPercent(p.gainPercent)})`}
                    </span>
                  </>
                )}
              </span>
            </TableCell>
            <TableCell>
              {p.thesisScore !== null ? (
                // The signature gauge, at table scale.
                <ThesisGauge
                  score={p.thesisScore}
                  previousScore={p.thesisPreviousScore ?? undefined}
                  size="mini"
                  orientation="horizontal"
                />
              ) : p.hasThesis ? (
                <Badge variant="default" dot>
                  Not checked
                </Badge>
              ) : (
                <Badge variant="caution" dot>
                  None yet
                </Badge>
              )}
            </TableCell>
            <TableCell numeric>
              <PositionRowActions
                positionId={p.id}
                ticker={p.ticker}
                quantity={p.quantity}
                avgBuyPrice={p.avgBuyPrice}
                buyDate={p.buyDate.toISOString().slice(0, 10)}
                hasHistory={p.hasThesis}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
