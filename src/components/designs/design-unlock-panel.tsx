"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnapshotThumbnail } from "@/components/dashboard/snapshot-thumbnail";
import { formatUnlockPrice, getDesignProductSummary } from "@/lib/design-unlock";
import { cn } from "@/lib/utils";

type UnlockProduct = {
  id: string;
  name: string;
  category: { name: string; slug?: string };
  count: number;
};

type DesignUnlockPanelProps = {
  designId: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  layoutData: string;
  thumbnailUrl: string | null;
  products: UnlockProduct[];
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
  products,
  freeUnlockAllowed = false,
  canceled = false,
  className,
  onUnlocked,
}: DesignUnlockPanelProps) {
  const [unlocking, setUnlocking] = useState(false);
  const { itemCount, productCount } = getDesignProductSummary(layoutData);
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
    <Card className={cn("motion-enter overflow-hidden py-0", className)}>
      <CardContent className="p-0">
        <div className="flex flex-col border-b border-border sm:flex-row">
          <SnapshotThumbnail
            src={thumbnailUrl}
            alt={name}
            className="w-full shrink-0 self-start sm:w-44 md:w-52"
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImageIcon width={24} height={24} className="opacity-50" />
                <span className="text-sm tabular-nums text-foreground">{itemCount}</span>
                <span className="text-caption">products</span>
              </div>
            }
          />

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-[var(--spacing-page-x)] py-[var(--spacing-panel-y)]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="draft">Draft</Badge>
              {itemCount > 0 && (
                <Badge variant="sage">{itemCount} placed</Badge>
              )}
            </div>
            <div>
              <h2 className="text-heading-3">{name}</h2>
              <p className="mt-1 text-body">
                {balconyWidthCm} × {balconyHeightCm} cm · {productCount} product
                {productCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="border-b border-border px-[var(--spacing-page-x)] py-[var(--spacing-panel-y)] lg:border-b-0 lg:border-r">
            {products.length > 0 ? (
              <ul>
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
                  >
                      <div className="min-w-0">
                        <p className="truncate text-nav font-semibold text-foreground">
                          {product.name}
                        </p>
                        <CategoryBadge
                          name={product.category.name}
                          slug={product.category.slug}
                          className="mt-1"
                        />
                      </div>
                    <Badge variant="secondary">×{product.count}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body">Add products in the designer before unlocking links.</p>
            )}
          </div>

          <div className="flex flex-col gap-5 px-[var(--spacing-page-x)] py-[var(--spacing-panel-y)]">
            {canceled && (
              <p className="motion-fade rounded-lg border border-border bg-muted px-3 py-2 text-body">
                Checkout canceled.
              </p>
            )}

            <div>
              <p className="text-caption">One-time unlock</p>
              <p className="text-stat mt-2">{price}</p>
            </div>

            <form action={`/api/checkout?designId=${designId}`} method="POST">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={productCount === 0}
              >
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

            <p className="text-caption">Paid once. Links stay on this account.</p>
          </div>
        </div>

        <div className="button-group border-t border-border px-[var(--spacing-page-x)] py-[var(--spacing-panel-y)]">
          <Button asChild variant="outline">
            <Link href={`/designer?id=${designId}`}>Edit design</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/designs">All designs</Link>
          </Button>
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
    <Card className={cn("motion-enter overflow-hidden py-0", className)}>
      <CardContent className="flex flex-col gap-5 px-[var(--spacing-page-x)] py-[var(--spacing-panel-y)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="unlocked" className="mb-3">
            Unlocked
          </Badge>
          <h2 className="text-heading-3">{name}</h2>
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
  );
}
