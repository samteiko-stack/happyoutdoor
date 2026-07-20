"use client";

import { Minus, Plus } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { LandingBtnOutline } from "@/components/landing/landing-buttons";
import { LandingSection } from "@/components/landing/landing-shell";
import { LandingReveal } from "@/components/landing/landing-reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is Happy Outdoor?",
    answer:
      "A 3D balcony designer. Pick a size or template, place catalog products, and save layouts with isometric previews.",
  },
  {
    question: "Do I need an account?",
    answer: "Yes — to save designs and unlock shopping links.",
  },
  {
    question: "How do shopping links work?",
    answer:
      "When your layout is ready, a one-time unlock fee gives you affiliate links for every product in the design.",
  },
  {
    question: "Can I start from a template?",
    answer: "Yes. Published templates open with products already placed. Edit freely.",
  },
  {
    question: "Which sizes are supported?",
    answer: "Widths 150–600 cm and depths 100–400 cm. Custom sizes when you start a design.",
  },
];

export function LandingFaq() {
  return (
    <LandingSection id="faq" section="large">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <LandingReveal>
          <div className="text-column-left">
            <div className="margin-bottom margin-small">
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="margin-bottom margin-large">
              <p className="max-width-small text-size-regular text-style-muted">
                Still have questions? We can help.
              </p>
            </div>
            <LandingBtnOutline href="/register" showArrow>
              Contact us
            </LandingBtnOutline>
          </div>
        </LandingReveal>

        <LandingReveal delay={120}>
          <AccordionPrimitive.Root
            type="single"
            collapsible
            defaultValue="item-0"
            className="flex flex-col gap-3"
          >
            {faqs.map((item, index) => (
              <AccordionPrimitive.Item
                key={item.question}
                value={`item-${index}`}
                className={cn(
                  "overflow-hidden rounded-2xl border border-transparent bg-white/[0.045]",
                  "motion-surface data-[state=open]:border-[color-mix(in_srgb,var(--landing-accent)_45%,transparent)]"
                )}
              >
                <AccordionPrimitive.Header asChild>
                  <div>
                    <AccordionPrimitive.Trigger
                      className={cn(
                        "group grid w-full cursor-pointer grid-cols-[2.75rem_minmax(0,1fr)_1.25rem]",
                        "items-center gap-x-4 px-5 py-[1.125rem] text-left font-sans outline-none",
                        "motion-interactive focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--landing-accent)_55%,transparent)]"
                      )}
                    >
                      <span className="text-[1.0625rem] font-semibold tabular-nums text-[var(--landing-accent)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.0625rem] font-medium leading-snug text-white">
                        {item.question}
                      </span>
                      <span className="relative size-5 text-white">
                        <Plus
                          className="absolute inset-0 size-5 group-data-[state=open]:hidden"
                          strokeWidth={1.75}
                        />
                        <Minus
                          className="absolute inset-0 hidden size-5 group-data-[state=open]:block"
                          strokeWidth={1.75}
                        />
                      </span>
                    </AccordionPrimitive.Trigger>
                  </div>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p
                    className="pb-[1.125rem] pl-[calc(1.25rem+2.75rem+1rem)] pr-5 font-sans text-sm leading-relaxed text-[var(--landing-muted)]"
                  >
                    {item.answer}
                  </p>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </LandingReveal>
      </div>
    </LandingSection>
  );
}
