import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";

type AppNavContainerSize = "sm" | "md" | "lg";

interface AppNavProps {
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  blur?: boolean;
  containerSize?: AppNavContainerSize;
  className?: string;
}

const containerSizeClasses: Record<AppNavContainerSize, string> = {
  sm: "max-w-4xl",
  md: "max-w-6xl",
  lg: "max-w-7xl",
};

export function AppNav({
  breadcrumbs,
  actions,
  sticky = true,
  blur = false,
  containerSize = "lg",
  className,
}: AppNavProps) {
  return (
    <header
      className={cn(
        "border-b border-border z-50",
        sticky && "sticky top-0",
        blur ? "bg-surface-nav backdrop-blur-md" : "bg-card shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          containerSizeClasses[containerSize],
          "mx-auto px-[var(--spacing-page-x)] py-[var(--spacing-nav-y)] flex items-center justify-between gap-4"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-brand shrink-0 hover:text-primary/80 transition-colors">
            Happy Outdoor
          </Link>
          {breadcrumbs && (
            <>
              <span className="text-nav-divider shrink-0">|</span>
              <div className="flex items-center gap-2 min-w-0 text-sm">{breadcrumbs}</div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {actions}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
