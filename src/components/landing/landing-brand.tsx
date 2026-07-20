import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

type LandingBrandSize = "nav" | "footer";

const brandSizes: Record<
  LandingBrandSize,
  { width: number; height: number; logoClassName: string }
> = {
  nav: { width: 96, height: 28, logoClassName: "h-6 w-auto" },
  footer: { width: 156, height: 46, logoClassName: "h-12 w-auto sm:h-14" },
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
  const { width, height, logoClassName } = brandSizes[size];

  return (
    <Link href={href} className={cn("motion-interactive inline-flex shrink-0", className)}>
      <Logo variant="light" width={width} height={height} className={logoClassName} />
    </Link>
  );
}
