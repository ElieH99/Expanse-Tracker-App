"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface AmountRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  onReset?: () => void;
  className?: string;
}

export function AmountRangeSlider({
  min,
  max,
  step = 10,
  value,
  onValueChange,
  onReset,
  className,
}: AmountRangeSliderProps) {
  const [hoveredThumb, setHoveredThumb] = React.useState<0 | 1 | null>(null);

  const isFiltered = value[0] > min || value[1] < max;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-input bg-background px-3 h-10 w-[280px] shrink-0",
        className
      )}
    >
      <span className="text-xs text-muted-foreground whitespace-nowrap w-[88px] shrink-0 truncate">
        {isFiltered ? `$${value[0].toLocaleString()} – $${value[1].toLocaleString()}` : "Amount"}
      </span>

      {/* Slider with per-thumb hover tooltips */}
      <div className="relative flex items-center flex-1">
        <SliderPrimitive.Root
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={(v) => onValueChange(v as [number, number])}
          className="relative flex w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
            <SliderPrimitive.Range className="absolute h-full bg-gray-900" />
          </SliderPrimitive.Track>

          {value.map((_: number, i: number) => (
            <SliderPrimitive.Thumb
              key={i}
              className="relative block h-4 w-4 rounded-full border border-gray-900/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 group"
              onMouseEnter={() => setHoveredThumb(i as 0 | 1)}
              onMouseLeave={() => setHoveredThumb(null)}
            >
              {hoveredThumb === i && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white shadow pointer-events-none">
                  ${value[i].toLocaleString()}
                </span>
              )}
            </SliderPrimitive.Thumb>
          ))}
        </SliderPrimitive.Root>
      </div>

      {/* Reset button — only visible when filtered */}
      <button
        onClick={onReset}
        aria-label="Reset amount filter"
        className={cn(
          "text-xs text-muted-foreground hover:text-foreground leading-none transition-opacity shrink-0",
          isFiltered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        ✕
      </button>
    </div>
  );
}
