import Link from "next/link";
import { LandingBrand } from "@/components/landing/landing-brand";
import { LandingContainer } from "@/components/landing/landing-shell";

const footerLinks = {
  Product: [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#templates", label: "Templates" },
  ],
  Resources: [
    { href: "#faq", label: "FAQ" },
    { href: "/login", label: "Log in" },
  ],
  Company: [
    { href: "#about", label: "About" },
    { href: "/register", label: "Sign up" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 py-12 text-sm">
      <LandingContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
          <div className="flex flex-col gap-3">
            <LandingBrand size="footer" />
            <p className="max-w-xs text-sm leading-relaxed text-[var(--landing-muted)]">
              Real catalog products, custom sizes, and saved 3D layouts.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <p className="mb-3 text-sm font-semibold text-white">{title}</p>
                <ul className="flex flex-col gap-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="motion-interactive text-sm text-[var(--landing-muted)] hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[var(--landing-muted-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Happy Outdoor. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/landing" className="motion-interactive hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/landing" className="motion-interactive hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </LandingContainer>
    </footer>
  );
}
