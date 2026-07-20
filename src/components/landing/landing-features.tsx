import { Check } from "lucide-react";
import { BalanceChartMockup, TemplateListMockup } from "@/components/landing/landing-mockups";
import { LandingBtnPrimary, LandingBtnWhite } from "@/components/landing/landing-buttons";
import { LandingSection } from "@/components/landing/landing-shell";
import { LandingReveal } from "@/components/landing/landing-reveal";

const bullets = [
  "Published templates with products already placed",
  "Custom sizes from 150–600 cm wide",
  "Plan view and isometric 3D preview",
  "Autosaved snapshots on every design",
];

export function LandingFeatures() {
  return (
    <>
      <LandingSection id="features" section="large">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <LandingReveal>
            <div className="text-column-left">
              <div className="margin-bottom margin-small">
                <h2>Built for Individuals and Apartments</h2>
              </div>
              <div className="margin-bottom margin-large">
                <ul className="space-y-4">
                  {bullets.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-size-regular text-style-muted"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-[var(--landing-accent)]/20">
                        <Check
                          className="size-3 text-color-accent"
                          strokeWidth={2.5}
                        />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <LandingBtnWhite href="/register" showArrow>
                Explore More
              </LandingBtnWhite>
            </div>
          </LandingReveal>

          <LandingReveal delay={120}>
            <div id="templates">
              <TemplateListMockup />
            </div>
          </LandingReveal>
        </div>
      </LandingSection>

      <LandingSection id="pricing" section="large">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <LandingReveal>
            <BalanceChartMockup />
          </LandingReveal>

          <LandingReveal delay={120}>
            <div className="text-column-left">
              <div className="margin-bottom margin-small">
                <h2>Take Control of Your Balcony Plan</h2>
              </div>
              <div className="margin-bottom margin-large">
                <p className="text-size-regular text-style-muted">
                  Products carry dimensions, top views, and 3D models. What you place is what
                  shows up in the preview and in your shopping list.
                </p>
              </div>
              <LandingBtnPrimary href="/register">Try now for Free</LandingBtnPrimary>
            </div>
          </LandingReveal>
        </div>
      </LandingSection>
    </>
  );
}
