"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollRailProps {
  children: ReactNode;
  /** Fixed width per item in px — ignored when visibleCount is set */
  itemWidth?: number;
  /** How many cards fit in the row; extras scroll horizontally */
  visibleCount?: number;
  gap?: number;
  /** Extend track into section padding so cards peek at the edge */
  bleed?: boolean;
  className?: string;
}

export function ScrollRail({
  children,
  itemWidth = 260,
  visibleCount,
  gap = 12,
  bleed = true,
  className,
}: ScrollRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const resolvedItemWidth =
    visibleCount && containerWidth > 0
      ? (containerWidth - gap * (visibleCount - 1)) / visibleCount
      : itemWidth;

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !visibleCount) return;

    const measure = () => setContainerWidth(container.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [visibleCount]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update, children, resolvedItemWidth]);

  function scrollByPage(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const step = (resolvedItemWidth + gap) * (visibleCount ? 1 : 2);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div ref={containerRef} className={cn("scroll-rail group/rail relative", className)}>
      {canPrev && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          className="motion-interactive absolute left-0 top-[calc(50%-0.5rem)] z-10 hidden -translate-y-1/2 border-border/80 bg-card/95 backdrop-blur-sm md:inline-flex"
        >
          <ChevronLeft className="size-4" />
        </Button>
      )}

      <div
        ref={trackRef}
        className={cn(
          "scroll-rail-track flex overflow-x-auto scroll-smooth motion-reduce:scroll-auto snap-x snap-mandatory",
          "pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          bleed && "-mx-[var(--spacing-page-x)] px-[var(--spacing-page-x)]"
        )}
        style={{ gap }}
      >
        {items.map((child) => {
          const key = child.key ?? undefined;
          return (
            <div
              key={key}
              className="scroll-rail-item shrink-0 snap-start"
              style={{ width: resolvedItemWidth }}
            >
              {child}
            </div>
          );
        })}
      </div>

      {canNext && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className="motion-interactive absolute right-0 top-[calc(50%-0.5rem)] z-10 hidden -translate-y-1/2 border-border/80 bg-card/95 backdrop-blur-sm md:inline-flex"
        >
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
