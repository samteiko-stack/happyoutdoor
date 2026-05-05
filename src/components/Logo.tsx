import Image from "next/image";

interface LogoProps {
  variant?: "color" | "white";
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ variant = "color", width = 120, height = 45, className }: LogoProps) {
  return (
    <Image
      src={variant === "white" ? "/logo-white.png" : "/logo-color.png"}
      alt="Happy Outdoor"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
