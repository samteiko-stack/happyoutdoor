"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";
import { formatUnlockPrice, getDesignProductSummary } from "@/lib/design-unlock";
import { cn } from "@/lib/utils";

type DesignUnlockPanelProps = {
  designId: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  layoutData: string;
  thumbnailUrl: string | null;
  freeUnlockAllowed?: boolean;
  canceled?: boolean;
  className?: string;
  onUnlocked?: () => void;
};

export function DesignUnlockPanel({
  designId,
  name,
  balconyWidthCm,
  balconyHeightCm,
  layoutData,
  thumbnailUrl,
  freeUnlockAllowed = false,
  canceled = false,
  className,
  onUnlocked,
}: DesignUnlockPanelProps) {
  const [unlocking, setUnlocking] = useState(false);
  const { productCount } = getDesignProductSummary(layoutData);
  const price = formatUnlockPrice();

  async function handlePreviewUnlock() {
    setUnlocking(true);
    try {
      const res = await fetch(`/api/designs/${designId}/unlock-preview`, {
        method: "POST",
      });
      if (res.ok) {
        onUnlocked?.();
      }
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div className={cn("contents", className)}>
      <DashboardSection title={name} flat>
        <article className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col sm:flex-row">
            <SnapshotThumbnail
              src={thumbnailUrl}
              alt={name}
              className="w-full sm:w-52 md:w-56 shrink-0"
              badge={<Badge variant="draft">Draft</Badge>}
              fallback={
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <ImageIcon width={20} height={20} className="opacity-50" />
                  <span className="text-sm tabular-nums text-foreground">{productCount}</span>
                  <span className="text-caption">products</span>
                </div>
              }
            />

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-[var(--spacing-page-x)] py-[var(--spacing-panel-y)]">
              <p className="text-body">
                {balconyWidthCm} × {balconyHeightCm} cm · {productCount} product
                {productCount === 1 ? "" : "s"}
              </p>
              {productCount === 0 && (
                <p className="text-body">Add products in the designer first.</p>
              )}
            </div>
          </div>
        </article>
      </DashboardSection>

      <section className="surface-panel motion-enter">
        {canceled && (
          <p className="motion-fade mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-body">
            Checkout canceled.
          </p>
        )}

        <p className="text-stat">{price}</p>

        <form action={`/api/checkout?designId=${designId}`} method="POST" className="mt-4">
          <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={productCount === 0}>
            Unlock links
            <ArrowRight className="size-4" />
          </Button>
        </form>

        {freeUnlockAllowed && (
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full sm:w-auto"
            disabled={unlocking || productCount === 0}
            onClick={handlePreviewUnlock}
          >
            {unlocking ? "Unlocking…" : "Unlock free (dev)"}
          </Button>
        )}
      </section>

      <div className="button-group">
        <Button asChild variant="outline">
          <Link href={`/designer?id=${designId}`}>Edit design</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/designs">All designs</Link>
        </Button>
      </div>
    </div>
  );
}

export function DesignUnlockedPanel({
  designId,
  name,
  className,
}: {
  designId: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={cn("contents", className)}>
      <Card className="motion-enter">
        <CardContent className="flex flex-col gap-5 py-[var(--spacing-panel-y)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="unlocked" className="mb-3">
              Unlocked
            </Badge>
            <h2 className="text-heading-2">{name}</h2>
            <p className="mt-1 text-body">Shopping links are ready.</p>
          </div>
          <div className="button-group shrink-0">
            <Button asChild>
              <Link href={`/designs/${designId}/links`}>
                View links
                <ExternalLink className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/designer?id=${designId}`}>Edit design</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="button-group">
        <Button asChild variant="outline">
          <Link href="/designs">All designs</Link>
        </Button>
      </div>
    </div>
  );
}
