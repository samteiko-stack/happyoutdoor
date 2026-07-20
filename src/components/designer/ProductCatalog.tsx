"use client";

import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Flower2,
  Lamp,
  Leaf,
  Package,
  Palette,
  Plus,
  Table2,
  Trash2,
} from "lucide-react";
import { useDesignerStore } from "@/lib/designer-store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  seating: Armchair,
  tables: Table2,
  lighting: Lamp,
  plants: Leaf,
  planters: Flower2,
  decor: Palette,
};

function CategoryIcon({ slug, icon }: { slug: string; icon: string | null }) {
  const Icon = CATEGORY_ICONS[slug] ?? CATEGORY_ICONS[icon ?? ""] ?? Package;
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground">
      <Icon className="size-3.5" strokeWidth={1.75} />
    </span>
  );
}

export function ProductCatalog({
  defaultOpenAll = true,
}: {
  /** Landing demo starts collapsed so the cursor can open categories. */
  defaultOpenAll?: boolean;
}) {
  const {
    products,
    categories,
    items,
    selectedItemId,
    setSelectedItemId,
    quickAddProduct,
    deleteItem,
  } = useDesignerStore();

  const groupedProducts = categories
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cat) => ({
      ...cat,
      products: products.filter((p) => p.categoryId === cat.id),
    }))
    .filter((group) => group.products.length > 0);

  const canvasItems = items
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((item) => item.product);

  return (
    <aside className="designer-catalog" data-demo-panel="catalog">
      <div className="designer-catalog-header">
        <h2 className="designer-catalog-title">Catalog</h2>
        <p className="designer-catalog-subtitle">Tap to place on balcony</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" data-demo="catalog-scroll">
        <Accordion
          type="multiple"
          defaultValue={defaultOpenAll ? categories.map((c) => c.id) : []}
        >
          {groupedProducts.map((group) => (
            <AccordionItem key={group.id} value={group.id} className="border-border/70">
              <AccordionTrigger
                className="designer-catalog-trigger px-4 py-3 hover:no-underline"
                data-demo="catalog-category"
                data-demo-id={group.id}
              >
                <span className="flex items-center gap-2.5">
                  <CategoryIcon slug={group.slug} icon={group.icon} />
                  <span className="text-sm font-medium">{group.name}</span>
                  <Badge variant="secondary" className="ml-auto mr-1 tabular-nums">
                    {group.products.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-2 pt-0">
                <div className="space-y-1.5">
                  {group.products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => quickAddProduct(product.id)}
                      className="designer-product-card group"
                      data-demo="catalog-product"
                      data-demo-id={product.id}
                    >
                      <div className="designer-product-thumb">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="size-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {product.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {product.widthCm}×{product.heightCm} cm
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background opacity-0 transition-opacity group-hover:opacity-100">
                          <Plus className="size-3.5" strokeWidth={2} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="designer-catalog-footer">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">On balcony</h3>
          <Badge variant="secondary" className="tabular-nums">
            {canvasItems.length}
          </Badge>
        </div>

        <div className="max-h-52 overflow-y-auto px-3 pb-3">
          {canvasItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
              Nothing placed yet
            </p>
          ) : (
            <div className="space-y-1">
              {canvasItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setSelectedItemId(selectedItemId === item.id ? null : item.id)
                  }
                  data-demo="catalog-placed"
                  data-demo-id={item.id}
                  className={cn(
                    "designer-canvas-item group",
                    selectedItemId === item.id && "designer-canvas-item-selected"
                  )}
                >
                  <div className="designer-product-thumb size-9">
                    {item.product!.imageUrl ? (
                      <img
                        src={item.product!.imageUrl}
                        alt={item.product!.name}
                        className="size-full object-contain p-0.5"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        {item.product!.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{item.product!.name}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost-destructive"
                    size="icon-xs"
                    className={cn(
                      "shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
                      selectedItemId === item.id && "opacity-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
