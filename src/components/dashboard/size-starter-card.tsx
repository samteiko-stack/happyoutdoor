import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SizeStarterCardProps {
  name: string;
  width: number;
  height: number;
  className?: string;
}

export function SizeStarterCard({
  name,
  width,
  height,
  className,
}: SizeStarterCardProps) {
  const ratio = width / height;

  return (
    <Link
      href={`/designer?w=${width}&h=${height}`}
      className={cn(
        "motion-interactive group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
        "hover:border-primary/25",
        className
      )}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-subtle">
        <div
          className="rounded-sm border-2 border-foreground/15 bg-muted transition-transform duration-[var(--motion-slow)] group-hover:scale-[1.02]"
          style={{
            width: `${Math.min(72, 40 * ratio)}%`,
            height: `${Math.min(56, 40 / Math.max(ratio, 0.8))}%`,
          }}
        />
        <div className="absolute left-2.5 top-2.5">
          <Badge variant="clay">Size</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-caption text-muted-foreground">
          {width} × {height} cm
        </p>
      </div>
    </Link>
  );
}
