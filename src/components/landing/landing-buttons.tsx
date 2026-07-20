import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LandingBtnProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
};

/** Solid CTA — matches dashboard banner primary actions. */
export function LandingBtnPrimary({
  href,
  children,
  className,
  showArrow = false,
}: LandingBtnProps) {
  return (
    <Button asChild variant="secondary" size="lg" className={className}>
      <Link href={href}>
        {children}
        {showArrow ? <ArrowRight width={16} height={16} /> : null}
      </Link>
    </Button>
  );
}

/** Ghost on dark — matches dashboard `on-primary` actions. */
export function LandingBtnOutline({
  href,
  children,
  className,
  showArrow = false,
}: LandingBtnProps) {
  return (
    <Button asChild variant="on-primary" size="lg" className={className}>
      <Link href={href}>
        {children}
        {showArrow ? <ArrowRight width={16} height={16} /> : null}
      </Link>
    </Button>
  );
}

/** Alias — same solid style as primary. */
export function LandingBtnWhite({
  href,
  children,
  className,
  showArrow = false,
}: LandingBtnProps) {
  return (
    <LandingBtnPrimary href={href} className={className} showArrow={showArrow}>
      {children}
    </LandingBtnPrimary>
  );
}

/** Compact nav CTA. */
export function LandingBtnNav({
  href,
  children,
  className,
}: Omit<LandingBtnProps, "showArrow">) {
  return (
    <Button asChild variant="secondary" size="default" className={cn(className)}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
