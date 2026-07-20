"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDesignerStore, type CanvasItem } from "@/lib/designer-store";
import { ProductCatalog } from "@/components/designer/ProductCatalog";
import { ToolBar } from "@/components/designer/ToolBar";
import { useLandingCanvasDemo } from "@/components/landing/use-landing-canvas-demo";

const IsometricScene = dynamic(
  () =>
    import("@/components/designer/IsometricScene").then((mod) => ({
      default: mod.IsometricScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-designer-canvas-bg text-sm text-muted-foreground">
        Loading 3D…
      </div>
    ),
  }
);

type TemplateRow = {
  id: string;
  name: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  layoutData: string;
};

function DemoCursor() {
  return (
    <div className="landing-demo-cursor" data-demo-cursor aria-hidden>
      <span className="landing-demo-cursor-ring" />
      <svg
        className="landing-demo-cursor-pointer"
        viewBox="0 0 24 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.5 2.5L5.5 22.5L10.2 17.9L13.1 25.1L16.2 23.8L13.2 16.4L19.5 15.9L5.5 2.5Z"
          fill="currentColor"
          stroke="#1a1f12"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** Landing designer embed — 3D only, with a calm auto-demo + cursor. */
export function LandingHeroCanvas() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const {
    setProducts,
    setCategories,
    setItems,
    setBalconySize,
    setDesignName,
    setDesignId,
    setSourceTemplateId,
    setTimeOfDay,
    setViewMode,
    designName,
  } = useDesignerStore();

  const handleSnapshotReady = useCallback((_fn: () => string) => {}, []);
  const demoShellRef = useLandingCanvasDemo(ready && !error);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setReady(false);
      setError(false);
      setDesignId(null);
      setSourceTemplateId(null);
      setItems([]);
      setDesignName("My Balcony Design");
      setBalconySize(300, 200);
      setViewMode("perspective");
      setTimeOfDay("night");

      try {
        const [productsRes, categoriesRes, templatesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
          fetch("/api/templates"),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) throw new Error("catalog");

        const products = await productsRes.json();
        const categories = await categoriesRes.json();
        if (cancelled) return;

        setProducts(products);
        setCategories(categories);

        if (templatesRes.ok) {
          const templates = (await templatesRes.json()) as TemplateRow[];
          const withLayout = templates.find((t) => {
            try {
              return JSON.parse(t.layoutData || "[]").length > 0;
            } catch {
              return false;
            }
          });
          const pick = withLayout ?? templates[0];
          if (pick) {
            setSourceTemplateId(pick.id);
            setDesignName(pick.name || "My Balcony Design");
            setBalconySize(pick.balconyWidthCm || 300, pick.balconyHeightCm || 200);
            try {
              const layoutItems = JSON.parse(pick.layoutData || "[]") as CanvasItem[];
              setItems(
                layoutItems.map((item) => ({
                  ...item,
                  id: crypto.randomUUID(),
                }))
              );
            } catch {
              setItems([]);
            }
          }
        }

        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          setError(true);
          setReady(true);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    setProducts,
    setCategories,
    setItems,
    setBalconySize,
    setDesignName,
    setDesignId,
    setSourceTemplateId,
    setViewMode,
    setTimeOfDay,
  ]);

  return (
    <div
      id="try-canvas"
      ref={demoShellRef}
      className="designer-shell relative h-[min(75vh,720px)] max-h-[720px] overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-[0_40px_100px_rgba(0,0,0,0.45)] pointer-events-none select-none"
    >
      <header className="designer-header">
        <div className="flex min-w-0 items-center gap-3">
          <span className="designer-header-name truncate">{designName}</span>
          {!ready ? (
            <span className="text-xs text-muted-foreground">Loading…</span>
          ) : null}
          {error ? (
            <span className="text-xs text-muted-foreground">Could not load template</span>
          ) : null}
        </div>
      </header>

      <ToolBar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="designer-stage min-w-0 flex-1">
          <div className="designer-viewport relative">
            {ready ? (
              <div className="absolute inset-0">
                <IsometricScene
                  onSnapshotReady={handleSnapshotReady}
                  frameloop="always"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-designer-canvas-bg text-sm text-muted-foreground">
                Loading designer…
              </div>
            )}
          </div>
        </div>
        <div className="min-h-0 w-[16rem] shrink-0 sm:w-[21rem]">
          <ProductCatalog defaultOpenAll={false} />
        </div>
      </div>

      <DemoCursor />
    </div>
  );
}
