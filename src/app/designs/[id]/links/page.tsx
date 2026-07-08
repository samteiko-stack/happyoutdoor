"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell, AppNav, PageContainer, PageHeader, LoadingState } from "@/components/layout";

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
    return <LoadingState message="Loading..." />;
  }

  if (!design) {
    return <LoadingState message="Design not found" />;
  }

  if (!design.isPaid) {
    return (
      <AppShell surface="muted">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Links Not Unlocked</CardTitle>
              <CardDescription>You need to unlock this design to view product links.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/designs/${design.id}`}>
                <Button className="w-full">Go to Design</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
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
    <AppShell surface="muted">
      <AppNav
        containerSize="sm"
        blur
        breadcrumbs={
          <>
            <Link href="/designs" className="text-muted-foreground hover:text-foreground">
              My Designs
            </Link>
            <span className="text-nav-divider">/</span>
            <span className="font-medium text-foreground">{design.name} — Shopping Links</span>
          </>
        }
      />

      <PageContainer size="sm" className="py-8">
        <PageHeader
          size="heading-2"
          title="Your Shopping Links"
          description="Click on any product to purchase it directly"
          className="mb-6"
        />

        <div className="space-y-4">
          {usedProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-surface-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-body">
                      {product.category.name} &middot; ${product.price.toFixed(2)}
                    </p>
                    {product.description && (
                      <p className="text-caption mt-1">{product.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">x{product.count}</Badge>
                  {product.affiliateLink ? (
                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button>Shop Now</Button>
                    </a>
                  ) : (
                    <Button variant="outline" disabled>
                      Link unavailable
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Link href={`/designer?id=${design.id}`}>
            <Button variant="outline">Back to Designer</Button>
          </Link>
          <Link href="/designs">
            <Button variant="outline">All Designs</Button>
          </Link>
        </div>
      </PageContainer>
    </AppShell>
  );
}
