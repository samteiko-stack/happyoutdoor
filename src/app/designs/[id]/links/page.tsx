"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";

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
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!design) {
    return <div className="min-h-screen flex items-center justify-center"><p>Design not found</p></div>;
  }

  if (!design.isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Links Not Unlocked</CardTitle>
            <CardDescription>You need to unlock this design to view product links.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/designs/${design.id}`}>
              <Button className="w-full bg-primary hover:bg-primary/90">Go to Design</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-primary font-bold text-xl">Happy Balcony</Link>
            <span className="text-gray-300">|</span>
            <Link href="/designs" className="text-sm text-muted-foreground hover:text-gray-900">My Designs</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium">{design.name} - Shopping Links</span>
          </div>
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Shopping Links</h1>
          <p className="text-muted-foreground">Click on any product to purchase it directly</p>
        </div>

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
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category.name} &middot; ${product.price.toFixed(2)}
                    </p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">x{product.count}</Badge>
                  {product.affiliateLink ? (
                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-primary hover:bg-primary/90">
                        Shop Now
                      </Button>
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
      </div>
    </div>
  );
}
