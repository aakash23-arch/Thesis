'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-recessed">
      <SliderPrimitive.Range className="absolute h-full bg-accent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="focus-ring block h-5 w-5 rounded-full border border-accent bg-surface transition-transform duration-instrument ease-instrument hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export interface SliderFieldProps extends Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange'
> {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Appended to the readout, e.g. "%" or "x". */
  unit?: string;
  /** Explanatory line under the label. */
  hint?: string;
  /** Show the min and max as end labels under the track. */
  showBounds?: boolean;
}

/**
 * A labelled single-value slider with a live monospace readout -- the control the
 * thesis-template threshold pickers use, where the number matters as much as the
 * gesture.
 */
const SliderField = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderFieldProps
>(
  (
    {
      label,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      unit,
      hint,
      showBounds = false,
      className,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-baseline justify-between gap-4">
          <label
            htmlFor={id}
            className="text-caption font-medium uppercase tracking-[0.04em] text-ink-secondary"
          >
            {label}
          </label>
          <span className="font-mono text-data-small tabular-nums text-ink-primary">
            {value}
            {unit}
          </span>
        </div>

        <Slider
          ref={ref}
          id={id}
          value={[value]}
          onValueChange={([next]) => next !== undefined && onValueChange(next)}
          min={min}
          max={max}
          step={step}
          aria-label={label}
          {...props}
        />

        {(showBounds || hint) && (
          <div className="flex items-center justify-between gap-4">
            {hint ? (
              <p className="text-caption normal-case tracking-normal text-ink-tertiary">{hint}</p>
            ) : (
              <span />
            )}
            {showBounds && (
              <span className="shrink-0 font-mono text-caption tabular-nums text-ink-tertiary">
                {min}
                {unit} &ndash; {max}
                {unit}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
SliderField.displayName = 'SliderField';

export { Slider, SliderField };
