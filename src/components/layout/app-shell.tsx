import Link from "next/link";
import { cn } from "@/lib/utils";

type AppShellSurface = "default" | "subtle" | "muted";

interface AppShellProps {
  children: React.ReactNode;
  surface?: AppShellSurface;
  className?: string;
}

const surfaceClasses: Record<AppShellSurface, string> = {
  default: "bg-background",
  subtle: "bg-page-subtle",
  muted: "bg-surface-muted",
};

export function AppShell({ children, surface = "default", className }: AppShellProps) {
  return (
    <div className={cn("min-h-screen", surfaceClasses[surface], className)}>
      {children}
    </div>
  );
}
