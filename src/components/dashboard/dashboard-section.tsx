import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  href?: string;
  linkLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** When true, children sit flush on the page — no card panel */
  flat?: boolean;
}

export function DashboardSection({
  title,
  href,
  linkLabel = "View all",
  actions,
  children,
  className,
  flat = false,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        "motion-enter",
        !flat && "rounded-xl border border-border/60 bg-card p-[var(--spacing-page-x)]",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-heading-3">{title}</h2>
        <div className="flex shrink-0 items-center gap-3">
          {actions}
          {href && (
            <Link
              href={href}
              className="motion-interactive inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              {linkLabel}
              <ChevronRight width={14} height={14} />
            </Link>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
