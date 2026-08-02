import { formatINR, formatPercent } from '@/lib/format';
import type { SectorSlice } from '@/lib/positions';

/**
 * A neutral ink ramp, deliberately not the signal palette.
 *
 * Sector is a category, not a health state. The design rule is that green,
 * amber and red mean something specific -- spending them on "Banking" would
 * make the colours that carry a thesis warning indistinguishable from
 * decoration. Ordered darkest first so the largest exposure reads heaviest.
 */
const RAMP = ['#0F1419', '#2E3944', '#4A5560', '#69737D', '#8B949C', '#A9B0B6', '#C6CBCF'];

function shadeFor(index: number): string {
  return RAMP[Math.min(index, RAMP.length - 1)] ?? RAMP[RAMP.length - 1]!;
}

export function SectorBar({ slices }: { slices: SectorSlice[] }) {
  if (slices.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* A plain flex bar rather than a chart library: it is one stacked row of
          divs, and Recharts would add a client bundle for no gain. */}
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Sector exposure: ${slices
          .map((s) => `${s.sector} ${formatPercent(s.percent)}`)
          .join(', ')}`}
      >
        {slices.map((slice, index) => (
          <div
            key={slice.sector}
            style={{ width: `${slice.percent}%`, backgroundColor: shadeFor(index) }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {slices.map((slice, index) => (
          <li key={slice.sector} className="flex items-baseline gap-2">
            <span
              className="h-2 w-2 shrink-0 translate-y-px rounded-full"
              style={{ backgroundColor: shadeFor(index) }}
              aria-hidden
            />
            <span className="text-caption normal-case tracking-normal text-ink-secondary">
              {slice.sector}
            </span>
            <span className="font-mono text-caption tabular-nums text-ink-primary">
              {formatPercent(slice.percent)}
            </span>
            <span className="font-mono text-caption tabular-nums text-ink-tertiary">
              {formatINR(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
