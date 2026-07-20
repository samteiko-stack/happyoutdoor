"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout, AppPage, LoadingState, PageStack } from "@/components/layout";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { getDesignUnlockHref } from "@/lib/design-unlock";

interface CanvasItem {
  id: string;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  affiliateLink: string | null;
  imageUrl: string | null;
  category: { name: string };
}

interface Design {
  id: string;
  name: string;
  isPaid: boolean;
  layoutData: string;
}

export default function DesignLinksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [design, setDesign] = useState<Design | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setDesign(null);

    async function loadData() {
      try {
        const [designRes, productsRes] = await Promise.all([
          fetch(`/api/designs/${id}`, { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (designRes.ok) setDesign(await designRes.json());
        if (productsRes.ok) setProducts(await productsRes.json());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <AppPage>
          <LoadingState message="Loading…" />
        </AppPage>
      </AppLayout>
    );
  }

  if (!design) {
    return (
      <AppLayout>
        <AppPage>
          <LoadingState message="Design not found" />
        </AppPage>
      </AppLayout>
    );
  }

  if (!design.isPaid) {
    return (
      <AppLayout>
        <AppPage>
          <PageStack>
            <DashboardSection title={design.name} flat>
              <section className="surface-panel motion-enter">
                <Badge variant="draft" className="mb-3">
                  Draft
                </Badge>
                <p className="text-body">Unlock to view shopping links.</p>
                <Button asChild className="mt-4">
                  <Link href={getDesignUnlockHref(design.id)}>Unlock links</Link>
                </Button>
              </section>
            </DashboardSection>

            <div className="button-group">
              <Button asChild variant="outline">
                <Link href={`/designer?id=${design.id}`}>Edit design</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/designs">All designs</Link>
              </Button>
            </div>
          </PageStack>
        </AppPage>
      </AppLayout>
    );
  }

  const items: CanvasItem[] = JSON.parse(design.layoutData || "[]");
  const uniqueProductIds = [...new Set(items.map((i) => i.productId))];
  const usedProducts = uniqueProductIds
    .map((pid) => {
      const product = products.find((p) => p.id === pid);
      const count = items.filter((i) => i.productId === pid).length;
      return product ? { ...product, count } : null;
    })
    .filter(Boolean) as (Product & { count: number })[];

  return (
    <AppLayout>
      <AppPage>
        <PageStack>
          <DashboardSection title={design.name} flat>
            <div className="space-y-3">
              {usedProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-center gap-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="size-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          —
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">×{product.count}</Badge>
                      {product.affiliateLink ? (
                        <a
                          href={product.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm">
                            Shop
                            <ExternalLink className="size-3.5" />
                          </Button>
                        </a>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Unavailable
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DashboardSection>

          <div className="button-group">
            <Button asChild variant="outline">
              <Link href={`/designer?id=${design.id}`}>Edit design</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/designs">All designs</Link>
            </Button>
          </div>
        </PageStack>
      </AppPage>
    </AppLayout>
  );
}
