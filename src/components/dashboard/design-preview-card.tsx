import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";
import { cn } from "@/lib/utils";

interface DesignPreviewCardProps {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  updatedAt: string;
  isPaid: boolean;
  thumbnailUrl: string | null;
  layoutData: string;
  featured?: boolean;
  className?: string;
}

function getItemCount(layoutData: string) {
  try {
    return JSON.parse(layoutData).length;
  } catch {
    return 0;
  }
}

export function DesignPreviewCard({
  id,
  name,
  balconyWidthCm,
  balconyHeightCm,
  updatedAt,
  isPaid,
  thumbnailUrl,
  layoutData,
  featured = false,
  className,
}: DesignPreviewCardProps) {
  const itemCount = getItemCount(layoutData);
  const formattedDate = new Date(updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/designer?id=${id}`}
      className={cn(
        "motion-interactive group flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        "hover:border-primary/25",
        className
      )}
    >
      <SnapshotThumbnail
        src={thumbnailUrl}
        alt={name}
        badge={
          <div className="flex flex-col items-start gap-1.5">
            {featured ? <Badge variant="neutral">Most recent</Badge> : null}
            <Badge variant={isPaid ? "unlocked" : "draft"}>
              {isPaid ? "Unlocked" : "Draft"}
            </Badge>
          </div>
        }
        fallback={
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageIcon width={20} height={20} className="opacity-50" />
            <span className="text-sm tabular-nums text-foreground">{itemCount}</span>
            <span className="text-caption">products</span>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
        <p className="truncate text-caption text-muted-foreground">
          {balconyWidthCm} × {balconyHeightCm} cm · {formattedDate}
        </p>
      </div>
    </Link>
  );
}

export function getDesignItemCount(layoutData: string) {
  return getItemCount(layoutData);
}
