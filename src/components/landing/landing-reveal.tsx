"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  as?: ElementType;
  className?: string;
  /** Stagger delay in ms */
  delay?: number;
  children: React.ReactNode;
};

function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

/**
 * Calm scroll reveal — opacity + slight rise using motion tokens.
 * Plays once when the block enters the viewport.
 */
export function LandingReveal({
  as: Tag = "div",
  className,
  delay = 0,
  children,
}: RevealProps) {
  const { ref, inView } = useInViewOnce<HTMLElement>();

  return (
    <Tag
      ref={ref}
      className={cn("landing-reveal", inView && "is-inview", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Observes once, then staggers direct `.landing-reveal-item` children via CSS. */
export function LandingRevealStagger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn("landing-reveal-stagger", inView && "is-inview", className)}
    >
      {children}
    </div>
  );
}
