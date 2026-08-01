/**
 * Indian digit grouping -- 1842600 renders as 18,42,600, not 1,842,600. The
 * lakh/crore convention is what the user sees in their broker statement, so it
 * is what the product must show.
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(
  value: number,
  options?: { decimals?: boolean; symbol?: boolean },
): string {
  const { decimals = false, symbol = true } = options ?? {};
  const magnitude = Math.abs(value);
  const formatted = decimals
    ? inrDecimalFormatter.format(magnitude)
    : inrFormatter.format(magnitude);
  // The sign leads the symbol: -₹12,400, never ₹-12,400.
  const sign = value < 0 ? '-' : '';
  return symbol ? `${sign}₹${formatted}` : `${sign}${formatted}`;
}

/** Compact Indian scale: 1.84 Cr, 4.20 L. Used where column width is tight. */
export function formatINRCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return formatINR(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Signed percentage for day-change and P&L readouts: +2.3%, -11.7%. */
export function formatSignedPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/** Always carries an explicit sign -- for P&L, where +0 and -0 read differently. */
export function formatSignedINR(value: number): string {
  return `${value >= 0 ? '+' : '-'}₹${inrFormatter.format(Math.abs(value))}`;
}
