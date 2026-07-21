import Link from "next/link";
import { Logo, type LogoSize } from "@/components/Logo";
import { cn } from "@/lib/utils";

type LandingBrandSize = "nav" | "footer";

const brandSizes: Record<LandingBrandSize, LogoSize> = {
  nav: "nav",
  footer: "footer",
};

export function LandingBrand({
  href = "/landing",
  className,
  size = "nav",
}: {
  href?: string;
  className?: string;
  size?: LandingBrandSize;
}) {
  return (
    <Link href={href} className={cn("motion-interactive inline-flex shrink-0", className)}>
      <Logo variant="light" size={brandSizes[size]} />
    </Link>
  );
}
