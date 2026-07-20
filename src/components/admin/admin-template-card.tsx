import Link from "next/link";
import { ImageIcon, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";
import { cn } from "@/lib/utils";

interface AdminTemplateCardProps {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  thumbnailUrl?: string | null;
  isPublished: boolean;
  className?: string;
}

export function AdminTemplateCard({
  id,
  name,
  balconyWidthCm,
  balconyHeightCm,
  thumbnailUrl,
  isPublished,
  className,
}: AdminTemplateCardProps) {
  return (
    <article
      className={cn(
        "motion-interactive flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
        "hover:border-primary/25",
        className
      )}
    >
      <Link href={`/designer?template=${id}`} className="group block min-w-0">
        <SnapshotThumbnail
          src={thumbnailUrl}
          alt={name}
          badge={
            <Badge variant={isPublished ? "unlocked" : "draft"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
          }
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon width={20} height={20} className="text-muted-foreground/50" />
            </div>
          }
        />
        <div className="flex flex-col gap-1 p-3.5">
          <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
          <p className="text-caption text-muted-foreground">
            {balconyWidthCm} × {balconyHeightCm} cm
          </p>
        </div>
      </Link>

      <div className="button-group mt-auto border-t border-border/70 p-3 pt-2.5">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/designer?template=${id}`}>
            <Pencil className="size-3.5" />
            Edit layout
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="flex-1">
          <Link href="/admin/templates">Details</Link>
        </Button>
      </div>
    </article>
  );
}
