"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Dot = {
  el: HTMLDivElement;
  x: number;
  y: number;
  seed: number;
  baseScale: number;
};

type Field = { x: number; y: number };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function PulseDots() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || prefersReducedMotion()) return;

    let disposed = false;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let ctx: gsap.Context | null = null;
    let tick: (() => void) | null = null;

    const teardown = () => {
      if (tick) {
        gsap.ticker.remove(tick);
        tick = null;
      }
      ctx?.revert();
      ctx = null;
      container.innerHTML = "";
      container.classList.remove("is-ready");
    };

    const mount = () => {
      if (disposed) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width < 10 || height < 10) return;

      teardown();

      ctx = gsap.context(() => {
        const spacing = 28;
        const dots: Dot[] = [];

        for (let y = 0; y <= height; y += spacing) {
          for (let x = 0; x <= width; x += spacing) {
            const el = document.createElement("div");
            el.className = "energy-dot";
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            container.appendChild(el);
            dots.push({
              el,
              x,
              y,
              seed: Math.random() * 100,
              baseScale: 0.85 + Math.random() * 0.15,
            });
          }
        }

        container.classList.add("is-ready");

        const fields: Field[] = [
          { x: width * 0.2, y: height * 0.3 },
          { x: width * 0.7, y: height * 0.5 },
          { x: width * 0.5, y: height * 0.8 },
        ];

        fields.forEach((field) => {
          const moveField = () => {
            if (disposed) return;
            gsap.to(field, {
              x: Math.random() * width,
              y: Math.random() * height,
              duration: 6 + Math.random() * 8,
              ease: "sine.inOut",
              onComplete: moveField,
            });
          };
          moveField();
        });

        tick = () => {
          const time = performance.now() * 0.001;

          dots.forEach((dot) => {
            let influence = 0;

            fields.forEach((field) => {
              const dx = dot.x - field.x;
              const dy = dot.y - field.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              influence += Math.max(0, 1 - distance / 160);
            });

            influence = Math.min(influence, 1);

            const pulse = Math.sin(time * 2.2 + dot.seed) * 0.08;
            const pulse2 = Math.sin(time * 1.4 + dot.seed * 2) * 0.05;

            gsap.set(dot.el, {
              scale: dot.baseScale + influence * 0.45 + pulse * 0.6 + pulse2 * 0.6,
              opacity: 0.04 + influence * 0.3 + Math.abs(pulse) * 0.05,
            });
          });
        };

        gsap.ticker.add(tick);
      }, container);
    };

    const frame = requestAnimationFrame(mount);

    const observer = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(mount, 120);
    });
    observer.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
      teardown();
    };
  }, []);

  return <div ref={ref} className="pulse-dots" aria-hidden />;
}
