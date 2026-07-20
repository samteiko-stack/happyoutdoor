import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSection } from "@/components/landing/landing-shell";
import { LandingReveal } from "@/components/landing/landing-reveal";
import { LandingScrollText } from "@/components/landing/landing-scroll-text";

export function LandingIntroStats() {
  return (
    <LandingSection id="about" section="large">
      <LandingReveal>
        <div className="margin-bottom margin-medium">
          <span className="label-pill">About us</span>
        </div>
      </LandingReveal>

      <div className="margin-bottom margin-large">
        <LandingScrollText text="Happy Outdoor helps people design balconies with real products — not generic furniture blocks. See the layout, adjust sizes, then unlock shopping links for everything in your plan." />
      </div>

      <LandingReveal delay={160}>
        <Button asChild variant="on-primary" size="lg">
          <Link href="#features">
            Learn more
            <ArrowRight width={16} height={16} />
          </Link>
        </Button>
      </LandingReveal>
    </LandingSection>
  );
}
