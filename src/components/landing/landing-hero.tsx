"use client";

import dynamic from "next/dynamic";
import { LandingContainer } from "@/components/landing/landing-shell";
import {
  LandingBtnOutline,
  LandingBtnPrimary,
} from "@/components/landing/landing-buttons";

const LandingHeroCanvas = dynamic(
  () =>
    import("@/components/landing/landing-hero-canvas").then((mod) => ({
      default: mod.LandingHeroCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(75vh,720px)] items-center justify-center rounded-2xl border border-border bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading designer…</p>
      </div>
    ),
  }
);

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-24">
      <div className="absolute inset-0 landing-grass" />
      <div className="absolute inset-0 landing-vignette" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[45%] bg-gradient-to-t from-[var(--landing-bg)] via-[var(--landing-bg)]/80 to-transparent" />

      <div className="relative z-10">
        <LandingContainer>
          {/* Marketing type — scoped. Designer stays outside .landing-type. */}
          <div className="landing-type">
            <div className="text-column padding-section-medium motion-enter">
              <div className="margin-bottom margin-small">
                <h1>
                  Our 3D designer simplifies your{" "}
                  <span className="text-style-italic">balcony plan</span>
                </h1>
              </div>

              <div className="margin-bottom margin-medium">
                <p className="max-width-small text-size-regular text-style-muted">
                  Place real products on your floor plan, preview in isometric view, and unlock
                  shopping links when you are ready.
                </p>
              </div>

              <div className="margin-bottom margin-large">
                <div className="button-group">
                  <LandingBtnPrimary href="/register">Try Free Trial</LandingBtnPrimary>
                  <LandingBtnOutline href="#try-canvas" showArrow>
                    Try the canvas
                  </LandingBtnOutline>
                </div>
              </div>
            </div>
          </div>

          <div className="margin-bottom margin-xxlarge">
            <LandingHeroCanvas />
          </div>
        </LandingContainer>
      </div>
    </section>
  );
}
