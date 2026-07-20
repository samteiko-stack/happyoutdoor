import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "dark" | "light" | "mark" | "color" | "white";

interface LogoProps {
  /** dark = green wordmark on light bg, light = white wordmark on dark bg, mark = icon only */
  variant?: LogoVariant;
  width?: number;
  height?: number;
  className?: string;
}

const sources: Record<LogoVariant, string> = {
  dark: "/logo-dark.png",
  light: "/logo-light.png",
  mark: "/brand-mark.png",
  color: "/logo-dark.png",
  white: "/logo-light.png",
};

export function Logo({ variant = "dark", width = 120, height = 45, className }: LogoProps) {
  const resolved = variant === "color" ? "dark" : variant === "white" ? "light" : variant;
  const isMark = resolved === "mark";

  return (
    <Image
      src={sources[resolved]}
      alt="Happy Outdoor"
      width={isMark ? height : width}
      height={height}
      className={cn("block h-auto max-w-none object-contain", isMark && "aspect-square", className)}
      priority
    />
  );
}
