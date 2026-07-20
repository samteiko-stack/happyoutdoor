import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardPanel({ title, children, className }: PanelProps) {
  return (
    <section className={cn("surface-panel", className)}>
      <h2 className="text-panel-title">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface ListRowProps {
  href: string;
  primary: string;
  secondary: string;
  status: string;
  statusVariant: "draft" | "unlocked" | "neutral";
}

export function DashboardListRow({
  href,
  primary,
  secondary,
  status,
  statusVariant,
}: ListRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
    >
      <div className="min-w-0">
        <p className="truncate text-nav font-semibold text-foreground">{primary}</p>
        <p className="truncate text-caption text-muted-foreground">{secondary}</p>
      </div>
      <Badge variant={statusVariant}>{status}</Badge>
    </Link>
  );
}

export function DashboardEmptyPanel({ message }: { message: string }) {
  return <p className="py-6 text-body text-muted-foreground">{message}</p>;
}

interface OverviewChartProps {
  designCount: number;
}

export function DashboardOverviewPanel({ designCount }: OverviewChartProps) {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  return (
    <section className="surface-panel">
      <h2 className="text-panel-title">Design overview</h2>
      <div className="relative mt-6 h-[var(--spacing-chart-height)]">
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="border-t border-border/60" />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
          {months.map((month) => (
            <span key={month} className="text-caption text-muted-foreground">
              {month}
            </span>
          ))}
        </div>
        {designCount > 0 && (
          <div className="absolute right-[8%] bottom-[38%] size-2.5 rounded-full bg-primary" />
        )}
      </div>
    </section>
  );
}
