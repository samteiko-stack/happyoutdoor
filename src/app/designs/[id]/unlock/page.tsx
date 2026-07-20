"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout, AppPage, LoadingState, PageStack } from "@/components/layout";
import {
  DesignUnlockPanel,
  DesignUnlockedPanel,
} from "@/components/designs/design-unlock-panel";

interface Design {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  isPaid: boolean;
  layoutData: string;
  thumbnailUrl: string | null;
}

interface Product {
  id: string;
  name: string;
  category: { name: string };
}

function DesignUnlockContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [design, setDesign] = useState<Design | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const canceled = searchParams.get("canceled") === "true";
  const freeUnlockAllowed =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ALLOW_FREE_UNLOCK === "true";

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setDesign(null);
    setProducts([]);

    async function loadData() {
      try {
        const [designRes, productsRes] = await Promise.all([
          fetch(`/api/designs/${id}`, { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
        ]);
        if (cancelled) return;

        if (designRes.ok) {
          setDesign(await designRes.json());
        }
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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
          <LoadingState message="Loading design…" />
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

  const items = (() => {
    try {
      return JSON.parse(design.layoutData || "[]") as { productId: string }[];
    } catch {
      return [];
    }
  })();

  const usedProducts = [...new Set(items.map((item) => item.productId))]
    .map((productId) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) return null;
      return {
        ...product,
        count: items.filter((item) => item.productId === productId).length,
      };
    })
    .filter(Boolean) as Array<Product & { count: number }>;

  return (
    <AppLayout>
      <AppPage>
        <PageStack>
          {design.isPaid ? (
            <DesignUnlockedPanel designId={design.id} name={design.name} />
          ) : (
            <DesignUnlockPanel
              designId={design.id}
              name={design.name}
              balconyWidthCm={design.balconyWidthCm}
              balconyHeightCm={design.balconyHeightCm}
              layoutData={design.layoutData}
              thumbnailUrl={design.thumbnailUrl}
              products={usedProducts}
              freeUnlockAllowed={freeUnlockAllowed}
              canceled={canceled}
              onUnlocked={() => router.push(`/designs/${design.id}/links`)}
            />
          )}
        </PageStack>
      </AppPage>
    </AppLayout>
  );
}

export default function DesignUnlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <AppLayout>
          <AppPage>
            <LoadingState message="Loading design…" />
          </AppPage>
        </AppLayout>
      }
    >
      <DesignUnlockContent id={id} />
    </Suspense>
  );
}
