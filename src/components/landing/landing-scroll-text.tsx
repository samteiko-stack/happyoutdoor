"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap-client";
import { cn } from "@/lib/utils";

const DIM = 0.22;
const FULL = 1;

type LandingScrollTextProps = {
  text: string;
  className?: string;
};

export function LandingScrollText({ text, className }: LandingScrollTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    if (!wrap || !textEl) return;

    const words = gsap.utils.toArray<HTMLElement>("[data-word]", textEl);
    if (!words.length) return;

    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: FULL });
      return;
    }

    gsap.set(words, { opacity: DIM });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: "top 82%",
        end: "bottom 35%",
        scrub: 0.55,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const progress = self.progress;
          const total = words.length;

          words.forEach((word, index) => {
            const start = index / total;
            const end = (index + 1) / total;
            const opacity = gsap.utils.mapRange(start, end, DIM, FULL, progress);
            gsap.set(word, { opacity: gsap.utils.clamp(DIM, FULL, opacity) });
          });
        },
      });
    }, wrap);

    const refresh = () => ScrollTrigger.refresh();
    refresh();
    document.fonts.ready.then(refresh).catch(() => refresh());

    return () => ctx.revert();
  }, [text]);

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <div ref={wrapRef} className="w-full max-w-[64rem]">
      <p
        ref={textRef}
        className={cn("heading-style-h2 m-0 text-white", className)}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} data-word>
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}
