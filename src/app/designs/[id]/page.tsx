"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/UserMenu";

interface CanvasItem {
  id: string;
  productId: string;
  x: number;
  y: number;
  rotation: number;
}

interface Design {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  isPaid: boolean;
  layoutData: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: { name: string };
}

export default function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [design, setDesign] = useState<Design | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading design...</p>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Design not found</p>
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

  const totalPrice = usedProducts.reduce((sum, p) => sum + p.price * p.count, 0);

  const handlePreviewLinks = async () => {
    setUnlocking(true);
    try {
      const res = await fetch(`/api/designs/${id}/unlock-preview`, {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setDesign(updated);
      }
    } catch (error) {
      console.error("Failed to unlock preview:", error);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-primary font-bold text-xl">Happy Balcony</Link>
            <span className="text-gray-300">|</span>
            <Link href="/designs" className="text-sm text-muted-foreground hover:text-gray-900">My Designs</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium">{design.name}</span>
          </div>
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product list */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Products in Your Design</CardTitle>
                <CardDescription>
                  {items.length} items from {usedProducts.length} unique products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category.name} &middot; ${product.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">x{product.count}</Badge>
                        <p className="text-sm font-semibold mt-1">
                          ${(product.price * product.count).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Estimated Total</span>
                    <span className="text-lg text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment/Unlock card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Shopping Links</CardTitle>
                <CardDescription>
                  Get direct purchase links for all products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {design.isPaid ? (
                  <>
                    <div className="bg-secondary/20 text-primary p-4 rounded text-center">
                      <p className="font-semibold">Links Unlocked!</p>
                      <p className="text-sm mt-1">You have access to all product links</p>
                    </div>
                    <Link href={`/designs/${design.id}/links`}>
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        View Shopping Links
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-center py-2">
                      <p className="text-3xl font-bold">$9.99</p>
                      <p className="text-sm text-muted-foreground">one-time payment</p>
                    </div>
                    <form action={`/api/checkout?designId=${design.id}`} method="POST">
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        Unlock Shopping Links
                      </Button>
                    </form>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Button
                      onClick={handlePreviewLinks}
                      disabled={unlocking}
                      variant="outline"
                      className="w-full"
                    >
                      {unlocking ? "Unlocking..." : "Preview Links (Free)"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Secure payment via Stripe. Get clickable links to purchase all products.
                    </p>
                  </>
                )}

                <Separator />

                <Link href={`/designer?id=${design.id}`}>
                  <Button variant="outline" className="w-full">
                    Back to Designer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Balcony: {design.balconyWidthCm} x {design.balconyHeightCm} cm</p>
                  <p>Created: {new Date(design.createdAt).toLocaleDateString()}</p>
                  <p>Updated: {new Date(design.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
