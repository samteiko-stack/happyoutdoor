"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentToggleOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  demoId?: string;
};

type SegmentToggleProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void | Promise<void>;
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
  const [optimisticValue, setOptimisticValue] = useState(value);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!pendingRef.current) {
      setOptimisticValue(value);
    }
  }, [value]);

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === optimisticValue)
  );

  function handleSelect(next: T) {
    if (next === optimisticValue) return;

    const previous = optimisticValue;
    setOptimisticValue(next);

    const result = onValueChange(next);
    if (result && typeof (result as PromiseLike<void>).then === "function") {
      pendingRef.current = true;
      Promise.resolve(result)
        .catch(() => setOptimisticValue(previous))
        .finally(() => {
          pendingRef.current = false;
        });
    }
  }

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
        const isActive = optimisticValue === option.value;

        return (
          <button
            key={option.value}
            type="button"
            data-demo={option.demoId}
            aria-pressed={isActive}
            onClick={() => handleSelect(option.value)}
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
