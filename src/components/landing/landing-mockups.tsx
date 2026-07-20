import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingGlass } from "@/components/landing/landing-shell";

export function LandingPhoneMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-[260px] md:w-[300px]", className)}>
      <div className="rounded-[2.6rem] border-[8px] border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_50px_100px_rgba(0,0,0,0.55)]">
        <div className="overflow-hidden rounded-[2.1rem] bg-[#111]">
          <div className="flex items-center justify-between px-5 pt-3 text-size-tiny text-style-muted">
            <span>9:41</span>
            <span className="mx-auto h-4 w-20 rounded-full bg-black" />
            <span>●●</span>
          </div>

          <div className="mx-3 mt-3 rounded-2xl bg-[var(--landing-accent)] px-4 py-4 text-[var(--landing-accent-fg)]">
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-full bg-black/15" />
              <div>
                <div className="margin-bottom margin-xxsmall">
                  <p className="text-size-tiny opacity-70">My balcony</p>
                </div>
                <p className="text-size-small text-weight-bold">Cozy Bistro</p>
              </div>
            </div>
            <div className="margin-bottom margin-xxsmall mt-4">
              <p className="text-size-tiny opacity-70">Products placed</p>
            </div>
            <div className="margin-bottom margin-xsmall">
              <p className="heading-style-h3">6</p>
            </div>
            <div className="flex gap-2">
              <span className="flex-1 rounded-full bg-black/90 py-2 text-align-center text-size-tiny text-weight-bold text-color-white">
                Plan
              </span>
              <span className="flex-1 rounded-full bg-black/15 py-2 text-align-center text-size-tiny text-weight-bold">
                3D
              </span>
            </div>
          </div>

          <div className="space-y-2 px-4 py-3">
            {["Bistro chair", "Floor cushion", "String lights"].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5"
              >
                <span className="text-size-tiny text-color-white">{item}</span>
                <Check className="size-3.5 text-color-accent" strokeWidth={2.5} />
              </div>
            ))}
          </div>

          <div className="relative mx-3 mb-3 aspect-[16/9] overflow-hidden rounded-xl">
            <Image src="/hero-bg.jpg" alt="" fill className="object-cover" sizes="300px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepCardVisual({
  variant,
}: {
  variant: "setup" | "preview" | "stats";
}) {
  if (variant === "preview") {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <Image src="/hero-bg.jpg" alt="" fill className="object-cover" sizes="360px" />
        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[var(--landing-accent)] px-3 py-2.5 text-[var(--landing-accent-fg)]">
          <div className="margin-bottom margin-xxsmall">
            <p className="text-size-tiny text-weight-bold">3D preview ready</p>
          </div>
          <p className="text-size-tiny opacity-70">Isometric snapshot saved</p>
        </div>
      </div>
    );
  }

  if (variant === "setup") {
    return (
      <LandingGlass className="p-4">
        <div className="margin-bottom margin-xsmall">
          <div className="flex items-center justify-between">
            <p className="text-size-small text-weight-medium text-color-white">New design</p>
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--landing-accent)] text-[var(--landing-accent-fg)]">
              <Check className="size-3.5" strokeWidth={2.5} />
            </span>
          </div>
        </div>
        <div className="margin-bottom margin-xsmall">
          <div className="space-y-2">
            {[
              { label: "Width", value: "300 cm" },
              { label: "Depth", value: "200 cm" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5"
              >
                <span className="text-size-tiny text-style-muted">{row.label}</span>
                <span className="text-size-tiny text-weight-bold text-color-white">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="w-full rounded-full bg-[var(--landing-accent)] py-2.5 text-size-tiny text-weight-bold text-[var(--landing-accent-fg)]"
        >
          Continue
        </button>
      </LandingGlass>
    );
  }

  return (
    <LandingGlass className="p-4">
      <div className="margin-bottom margin-xxsmall">
        <p className="text-size-tiny text-style-muted">Design activity</p>
      </div>
      <div className="margin-bottom margin-small">
        <p className="heading-style-h4 text-color-white">Saved</p>
      </div>
      <div className="flex h-24 items-end gap-1.5">
        {[40, 62, 48, 78, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-[var(--landing-accent)]"
            style={{ height: `${h}%`, opacity: 0.45 + i * 0.07 }}
          />
        ))}
      </div>
    </LandingGlass>
  );
}

export function TemplateListMockup() {
  const items = [
    { name: "Cozy Bistro", size: "300 × 200 cm" },
    { name: "Garden Retreat", size: "400 × 250 cm" },
    { name: "Blank Small", size: "200 × 150 cm" },
    { name: "Friday Template", size: "300 × 200 cm" },
  ];

  return (
    <LandingGlass className="overflow-hidden p-2">
      <div className="px-4 py-3">
        <p className="text-size-small text-weight-bold text-color-white">Templates</p>
      </div>
      <ul className="space-y-1 px-2 pb-2">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 motion-interactive hover:bg-white/5"
          >
            <span className="size-9 shrink-0 rounded-lg bg-white/10" />
            <div className="min-w-0 flex-1">
              <div className="margin-bottom margin-xxsmall">
                <p className="truncate text-size-small text-color-white">{item.name}</p>
              </div>
              <p className="text-size-tiny text-style-muted">{item.size}</p>
            </div>
          </li>
        ))}
      </ul>
    </LandingGlass>
  );
}

export function BalanceChartMockup() {
  const bars = [28, 45, 38, 68, 52, 88, 64, 42, 76, 58];

  return (
    <LandingGlass className="p-6 md:p-8">
      <div className="margin-bottom margin-large">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="margin-bottom margin-xxsmall">
              <p className="text-size-small text-style-muted">Products placed</p>
            </div>
            <p className="heading-style-h3 text-color-white">24</p>
          </div>
          <span className="label-pill">This month</span>
        </div>
      </div>
      <div className="flex h-44 items-end gap-2">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-md bg-[var(--landing-accent)]"
            style={{ height: `${height}%`, opacity: 0.35 + (index % 3) * 0.2 }}
          />
        ))}
      </div>
    </LandingGlass>
  );
}
