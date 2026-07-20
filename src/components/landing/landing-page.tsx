import { LandingHero } from "@/components/landing/landing-hero";
import { LandingIntroStats } from "@/components/landing/landing-intro-stats";
import { LandingSteps } from "@/components/landing/landing-steps";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--landing-bg)] text-white">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingIntroStats />
        <LandingSteps />
        <LandingFeatures />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
