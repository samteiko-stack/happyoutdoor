import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "dark" | "light" | "mark" | "color" | "white";
export type LogoSize = "nav" | "sidebar" | "auth" | "authCompact" | "footer";

interface LogoProps {
  /** dark = green wordmark on light bg, light = white wordmark on dark bg, mark = icon only */
  variant?: LogoVariant;
  size?: LogoSize;
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

/** Wordmark PNG is 1024×264 */
const LOGO_ASPECT = 1024 / 264;

const logoSizeStyles: Record<LogoSize, string> = {
  nav: "h-10 w-auto",
  sidebar: "h-11 w-auto",
  auth: "h-12 w-auto",
  authCompact: "h-10 w-auto",
  footer: "h-12 w-auto sm:h-14",
};

const logoIntrinsicHeight: Record<LogoSize, number> = {
  nav: 40,
  sidebar: 44,
  auth: 48,
  authCompact: 40,
  footer: 56,
};

export function Logo({
  variant = "dark",
  size = "nav",
  width,
  height,
  className,
}: LogoProps) {
  const resolved = variant === "color" ? "dark" : variant === "white" ? "light" : variant;
  const isMark = resolved === "mark";
  const intrinsicHeight = height ?? (isMark ? 40 : logoIntrinsicHeight[size]);
  const intrinsicWidth = width ?? (isMark ? intrinsicHeight : Math.round(intrinsicHeight * LOGO_ASPECT));

  return (
    <Image
      src={sources[resolved]}
      alt="Happy Outdoor"
      width={intrinsicWidth}
      height={intrinsicHeight}
      className={cn(
        "block max-w-none shrink-0 object-contain",
        !isMark && logoSizeStyles[size],
        isMark && "aspect-square h-10 w-10",
        className
      )}
      priority
    />
  );
}
