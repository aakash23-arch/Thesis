'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getHealthColor, getHealthLabel } from '@/lib/health-score';

export interface ThesisGaugeProps {
  /** Current thesis health score, 0-100. */
  score: number;
  /** Previous reading -- renders an etched tick mark when provided. */
  previousScore?: number;
  /** 'full' is the hero gauge (24 x 180). 'mini' is the inline/table variant (12 x 64). */
  size?: 'full' | 'mini';
  /**
   * Vertical is the signature instrument. Horizontal is the mobile variant --
   * same proportions rotated, so the gauge survives a narrow column.
   */
  orientation?: 'vertical' | 'horizontal';
  /** Whether to render the Instrument Serif score number beside the gauge. Defaults to true for 'full', false for 'mini'. */
  showScoreLabel?: boolean;
  /** Optional caption under the score, e.g. "Thesis health". Only renders alongside the score label. */
  label?: string;
  className?: string;
}

const DIMENSIONS = {
  full: { thickness: 24, length: 180 },
  mini: { thickness: 12, length: 64 },
} as const;

/** Horizontal padding around the barrel so the previous-reading tick can overhang it. */
const TICK_OVERHANG = 3;

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function ThesisGauge({
  score,
  previousScore,
  size = 'full',
  orientation = 'vertical',
  showScoreLabel,
  label,
  className,
}: ThesisGaugeProps) {
  const clipId = React.useId();
  const titleId = React.useId();
  const reduceMotion = useReducedMotion();

  const { thickness, length } = DIMENSIONS[size];
  const clamped = clamp(score);
  const fillColor = getHealthColor(clamped);
  const statusLabel = getHealthLabel(clamped);
  const isVertical = orientation === 'vertical';

  // The barrel occupies `thickness x length` (or the transpose). The viewBox is
  // padded on the cross axis so the tick's overhang renders instead of clipping.
  const barrelW = isVertical ? thickness : length;
  const barrelH = isVertical ? length : thickness;
  const padX = isVertical ? TICK_OVERHANG : 0;
  const padY = isVertical ? 0 : TICK_OVERHANG;
  const svgW = barrelW + padX * 2;
  const svgH = barrelH + padY * 2;
  const radius = thickness / 2;

  const showLabel = showScoreLabel ?? size === 'full';

  const fillLength = (clamped / 100) * length;
  // Vertical fills bottom-up; horizontal fills left-to-right.
  const fillRect = isVertical
    ? { x: padX, y: padY + (length - fillLength), width: thickness, height: fillLength }
    : { x: padX, y: padY, width: fillLength, height: thickness };

  const tick =
    previousScore === undefined
      ? undefined
      : (() => {
          const offset = (clamp(previousScore) / 100) * length;
          return isVertical
            ? {
                x1: 0,
                x2: svgW,
                y1: padY + (length - offset),
                y2: padY + (length - offset),
              }
            : { x1: padX + offset, x2: padX + offset, y1: 0, y2: svgH };
        })();

  const description =
    previousScore === undefined
      ? `${statusLabel}. Thesis health score ${clamped} out of 100.`
      : `${statusLabel}. Thesis health score ${clamped} out of 100, ${
          clamped > previousScore
            ? 'up from'
            : clamped < previousScore
              ? 'down from'
              : 'unchanged from'
        } ${clamp(previousScore)}.`;

  return (
    <div
      className={cn(
        'inline-flex gap-4',
        isVertical ? 'items-center' : 'flex-col items-start',
        className,
      )}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={description}
        aria-labelledby={titleId}
        className="shrink-0 overflow-visible"
      >
        <title id={titleId}>{description}</title>

        {/* Barrel */}
        <rect
          x={padX + 0.5}
          y={padY + 0.5}
          width={barrelW - 1}
          height={barrelH - 1}
          rx={radius}
          fill="#F1F3F5"
          stroke="#E2E5E9"
          strokeWidth={1}
        />

        {/* Fill, clipped to the barrel's rounded shape */}
        <clipPath id={clipId}>
          <rect x={padX} y={padY} width={barrelW} height={barrelH} rx={radius} />
        </clipPath>
        <motion.rect
          clipPath={`url(#${clipId})`}
          fill={fillColor}
          initial={false}
          animate={fillRect}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Previous-reading tick -- overhangs the barrel on both sides, like an
            etched graduation mark on a physical instrument. */}
        {tick && <line {...tick} stroke="#5C6670" strokeWidth={2} />}
      </svg>

      {showLabel && (
        <div className="flex flex-col">
          <span className="font-serif text-hero leading-none text-ink-primary">{clamped}</span>
          {label && (
            <span className="mt-2 text-caption uppercase tracking-[0.04em] text-ink-secondary">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
