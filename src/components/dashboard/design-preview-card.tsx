"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";
import {
  getDesignLinksHref,
  getDesignUnlockHref,
  getDesignProductSummary,
} from "@/lib/design-unlock";
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
  onDelete?: () => void;
  className?: string;
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
  onDelete,
  className,
}: DesignPreviewCardProps) {
  const itemCount = getDesignProductSummary(layoutData).itemCount;
  const formattedDate = new Date(updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className={cn(
        "motion-interactive flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        "hover:border-primary/25",
        className
      )}
    >
      <Link href={`/designer?id=${id}`} className="group block">
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

      <div className="flex items-center gap-3 border-t border-border px-3.5 py-2.5">
        {isPaid ? (
          <Link
            href={getDesignLinksHref(id)}
            className="text-xs font-medium text-primary hover:text-brand-moss-dark"
          >
            Shopping links
          </Link>
        ) : (
          <Link
            href={getDesignUnlockHref(id)}
            className="text-xs font-medium text-primary hover:text-brand-moss-dark"
          >
            Unlock links
          </Link>
        )}
        <Link
          href={`/designer?id=${id}`}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Edit
        </Link>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
