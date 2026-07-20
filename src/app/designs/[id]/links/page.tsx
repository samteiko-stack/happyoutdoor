"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout, AppPage, AppPageHeader, LoadingState } from "@/components/layout";

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
    async function loadData() {
      const [designRes, productsRes] = await Promise.all([
        fetch(`/api/designs/${id}`),
        fetch("/api/products"),
      ]);
      if (designRes.ok) setDesign(await designRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      setLoading(false);
    }
    loadData();
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
          <Card>
            <CardHeader>
              <CardTitle>Links not unlocked</CardTitle>
              <CardDescription>Unlock this design to view product links.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/designs/${design.id}`}>
                <Button className="w-full">View design</Button>
              </Link>
            </CardContent>
          </Card>
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
        <AppPageHeader title="Shopping links" meta={design.name} />

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
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category.name}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary">×{product.count}</Badge>
                  {product.affiliateLink ? (
                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">Shop</Button>
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

        <div className="button-group mt-8">
          <Link href={`/designer?id=${design.id}`}>
            <Button variant="outline">Edit design</Button>
          </Link>
          <Link href="/designs">
            <Button variant="outline">All designs</Button>
          </Link>
        </div>
      </AppPage>
    </AppLayout>
  );
}
