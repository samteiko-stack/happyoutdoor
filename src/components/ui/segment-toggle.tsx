"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentToggleOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  demoId?: string;
};

type SegmentToggleProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentToggleOption<T>[];
  className?: string;
  "aria-label"?: string;
};

export function SegmentToggle<T extends string>({
  value,
  onValueChange,
  options,
  className,
  "aria-label": ariaLabel,
}: SegmentToggleProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  return (
    <div
      className={cn("segment-toggle", className)}
      role="group"
      aria-label={ariaLabel}
      style={{ "--segment-count": options.length } as CSSProperties}
    >
      <span
        aria-hidden
        className="segment-toggle-indicator"
        style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
      />
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            data-demo={option.demoId}
            aria-pressed={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "segment-toggle-item motion-interactive",
              isActive && "segment-toggle-item-active"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
