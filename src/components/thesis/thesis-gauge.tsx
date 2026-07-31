import { cn } from '@/lib/utils';
import { getHealthColor } from '@/lib/health-score';

export interface ThesisGaugeProps {
  /** Current thesis health score, 0-100. */
  score: number;
  /** Previous reading -- renders an etched tick mark when provided. */
  previousScore?: number;
  /** 'full' is the hero gauge (24 x 180). 'mini' is the inline/table variant (12 x 64). */
  size?: 'full' | 'mini';
  /** Whether to render the Instrument Serif score number beside the gauge. Defaults to true for 'full', false for 'mini'. */
  showScoreLabel?: boolean;
  className?: string;
}

const DIMENSIONS = {
  full: { width: 24, height: 180 },
  mini: { width: 12, height: 64 },
} as const;

export function ThesisGauge({
  score,
  previousScore,
  size = 'full',
  showScoreLabel,
  className,
}: ThesisGaugeProps) {
  const { width, height } = DIMENSIONS[size];
  const clamped = Math.max(0, Math.min(100, score));
  const fillHeight = (clamped / 100) * height;
  const fillY = height - fillHeight;
  const fillColor = getHealthColor(clamped);
  const rx = width / 2;

  const label = showScoreLabel ?? size === 'full';

  const tickY =
    previousScore !== undefined
      ? height - (Math.max(0, Math.min(100, previousScore)) / 100) * height
      : undefined;

  return (
    <div className={cn('inline-flex items-center gap-4', className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Thesis health score: ${clamped} out of 100`}
      >
        {/* Track */}
        <rect
          x={0.5}
          y={0.5}
          width={width - 1}
          height={height - 1}
          rx={rx}
          fill="#F1F3F5"
          stroke="#E2E5E9"
          strokeWidth={1}
        />
        {/* Fill, clipped to the track's rounded shape */}
        <clipPath id={`thesis-gauge-clip-${size}`}>
          <rect x={0} y={0} width={width} height={height} rx={rx} />
        </clipPath>
        <rect
          x={0}
          y={fillY}
          width={width}
          height={fillHeight}
          fill={fillColor}
          clipPath={`url(#thesis-gauge-clip-${size})`}
        />
        {/* Previous-reading tick mark */}
        {tickY !== undefined && (
          <line
            x1={-2}
            x2={width + 2}
            y1={tickY}
            y2={tickY}
            stroke="#5C6670"
            strokeWidth={2}
          />
        )}
      </svg>
      {label && (
        <span className="font-serif text-hero leading-none text-ink-primary">{clamped}</span>
      )}
    </div>
  );
}
