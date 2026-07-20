import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  thumbnailUrl?: string | null;
  className?: string;
}

export function TemplateCard({
  id,
  name,
  balconyWidthCm,
  balconyHeightCm,
  thumbnailUrl,
  className,
}: TemplateCardProps) {
  return (
    <Link
      href={`/designer?template=${id}`}
      className={cn(
        "motion-interactive group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
        "hover:border-primary/25",
        className
      )}
    >
      <SnapshotThumbnail
        src={thumbnailUrl}
        alt={name}
        badge={<Badge variant="sage">Template</Badge>}
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon width={20} height={20} className="text-muted-foreground/50" />
          </div>
        }
      />
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-caption text-muted-foreground">
          {balconyWidthCm} × {balconyHeightCm} cm
        </p>
      </div>
    </Link>
  );
}
