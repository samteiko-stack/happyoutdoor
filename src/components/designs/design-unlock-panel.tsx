"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("motion-enter overflow-hidden", className)}>
      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <SnapshotThumbnail
            src={thumbnailUrl}
            alt={name}
            className="hidden w-32 shrink-0 sm:block"
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImageIcon width={20} height={20} className="opacity-50" />
                <span className="text-sm tabular-nums text-foreground">{productCount}</span>
              </div>
            }
          />

          <div className="min-w-0">
            <Badge variant="draft" className="mb-3">
              Draft
            </Badge>
            <h2 className="text-heading-2">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {balconyWidthCm} × {balconyHeightCm} cm · {productCount} product
              {productCount === 1 ? "" : "s"}
            </p>
            {productCount === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Add products in the designer first.
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-auto lg:min-w-[15rem]">
          {canceled && (
            <p className="motion-fade rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Checkout canceled.
            </p>
          )}

          <p className="text-stat">{price}</p>

          <form action={`/api/checkout?designId=${designId}`} method="POST">
            <Button type="submit" className="w-full" size="lg" disabled={productCount === 0}>
              Unlock links
              <ArrowRight className="size-4" />
            </Button>
          </form>

          {freeUnlockAllowed && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={unlocking || productCount === 0}
              onClick={handlePreviewUnlock}
            >
              {unlocking ? "Unlocking…" : "Unlock free (dev)"}
            </Button>
          )}

          <div className="button-group">
            <Button asChild variant="outline">
              <Link href={`/designer?id=${designId}`}>Edit design</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/designs">All designs</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className={cn("motion-enter", className)}>
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="unlocked" className="mb-3">
            Unlocked
          </Badge>
          <h2 className="text-heading-2">{name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shopping links are ready.
          </p>
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
  );
}
