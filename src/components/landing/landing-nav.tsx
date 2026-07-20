"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { LandingBrand } from "@/components/landing/landing-brand";
import { LandingBtnNav } from "@/components/landing/landing-buttons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-[var(--padding-global)] pt-4">
      <div
        className={cn(
          "motion-surface mx-auto flex h-16 max-w-[var(--container-large)] items-center gap-3 rounded-2xl border px-4 backdrop-blur-xl sm:px-6",
          scrolled
            ? "border-white/15 bg-black/55 shadow-[0_8px_32px_rgb(0_0_0/0.35)]"
            : "border-[var(--landing-glass-border)] bg-[var(--landing-glass)]"
        )}
      >
        <LandingBrand size="nav" />

        <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="motion-interactive text-sm font-medium text-[var(--landing-muted)] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <LandingBtnNav href="/register" className="hidden sm:inline-flex">
            Get started
          </LandingBtnNav>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-[var(--landing-bg-elevated)] text-white">
              <SheetHeader>
                <SheetTitle className="text-left text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Link
                      href={link.href}
                      className="motion-interactive rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--landing-muted)] hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <LandingBtnNav href="/register" className="mt-3 w-full">
                    Get started
                  </LandingBtnNav>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
