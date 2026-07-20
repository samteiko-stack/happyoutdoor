import { StepCardVisual } from "@/components/landing/landing-mockups";
import { LandingGlass, LandingSection } from "@/components/landing/landing-shell";
import {
  LandingReveal,
  LandingRevealStagger,
} from "@/components/landing/landing-reveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Instant setup",
    description: "Pick your balcony size or open a published template.",
    variant: "setup" as const,
  },
  {
    title: "Live 3D preview",
    description: "Place catalog products and see the layout in isometric view.",
    variant: "preview" as const,
  },
  {
    title: "Real-time saves",
    description: "Every design stores a snapshot so you always know what you opened.",
    variant: "stats" as const,
  },
];

export function LandingSteps() {
  return (
    <LandingSection id="how-it-works" section="large">
      <LandingReveal>
        <div className="text-column">
          <div className="margin-bottom margin-small">
            <h2>
              Simple Steps to a <span className="text-style-italic">Finished Layout</span>
            </h2>
          </div>
          <div className="margin-bottom margin-xxlarge">
            <p className="text-size-regular text-style-muted">
              Everything you need to plan a balcony in one place.
            </p>
          </div>
        </div>
      </LandingReveal>

      <LandingRevealStagger className="mt-10 grid items-end gap-5 md:mt-14 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="landing-reveal-item">
            <LandingGlass
              className={cn(
                "flex h-full flex-col overflow-hidden p-5 md:p-6",
                index === 1 && "md:-translate-y-10 md:p-7"
              )}
            >
              <div className="margin-bottom margin-xxsmall">
                <h3 className="heading-style-h4">{step.title}</h3>
              </div>
              <div className="margin-bottom margin-small">
                <p className="text-size-regular text-style-muted">{step.description}</p>
              </div>
              <div className="mt-auto">
                <StepCardVisual variant={step.variant} />
              </div>
            </LandingGlass>
          </div>
        ))}
      </LandingRevealStagger>
    </LandingSection>
  );
}
