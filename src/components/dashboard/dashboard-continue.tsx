import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";

interface DashboardContinueProps {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  updatedAt: string;
  isPaid: boolean;
  thumbnailUrl: string | null;
  itemCount: number;
}

export function DashboardContinue({
  id,
  name,
  balconyWidthCm,
  balconyHeightCm,
  updatedAt,
  isPaid,
  thumbnailUrl,
  itemCount,
}: DashboardContinueProps) {
  const date = new Date(updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="motion-enter overflow-hidden py-0">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <SnapshotThumbnail
            src={thumbnailUrl}
            alt={name}
            className="w-full sm:w-52 md:w-56 shrink-0"
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImageIcon width={24} height={24} className="opacity-50" />
                <span className="text-sm tabular-nums text-foreground">{itemCount}</span>
                <span className="text-caption">products</span>
              </div>
            }
          />

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-5 sm:p-7">
            <div>
              <p className="text-caption text-muted-foreground">Continue</p>
              <h3 className="mt-1 text-heading-3">{name}</h3>
              <p className="mt-1 text-body">
                {balconyWidthCm} × {balconyHeightCm} cm · Updated {date}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isPaid ? "unlocked" : "draft"}>
                {isPaid ? "Unlocked" : "Draft"}
              </Badge>
              {itemCount > 0 && (
                <Badge variant="neutral">{itemCount} products</Badge>
              )}
            </div>

            <div className="button-group">
              <Button asChild>
                <Link href={`/designer?id=${id}`}>
                  Open design
                  <ArrowRight width={16} height={16} />
                </Link>
              </Button>
              {!isPaid && (
                <Button asChild variant="outline">
                  <Link href={`/designs/${id}`}>Unlock</Link>
                </Button>
              )}
              {isPaid && (
                <Button asChild variant="outline">
                  <Link href={`/designs/${id}/links`}>Links</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
