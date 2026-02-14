"use client";

import { useDesignerStore } from "@/lib/designer-store";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Trash, Plus } from "iconoir-react";

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, string> = {
  armchair: "🪑",
  lamp: "💡",
  leaf: "🌿",
  flower: "🌸",
  palette: "🎨",
  table: "🪵",
};

export function ProductCatalog() {
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

  // Build items on canvas with product info
  const canvasItems = items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  })).filter((item) => item.product);

  return (
    <div className="h-full flex flex-col bg-white border-l">
      {/* Product Catalog */}
      <div className="p-3 border-b bg-background">
        <h2 className="font-semibold text-sm">Add Products</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Click to add to your balcony
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <Accordion type="multiple" defaultValue={categories.map((c) => c.id)}>
          {groupedProducts.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger className="px-3 py-2.5 hover:bg-gray-50 text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-base">
                    {CATEGORY_ICONS[group.icon || ""] || "📦"}
                  </span>
                  <span className="font-medium text-sm">{group.name}</span>
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {group.products.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-1">
                <div className="space-y-0.5">
                  {group.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => quickAddProduct(product.id)}
                      className="w-full text-left p-2 rounded transition-all hover:bg-secondary/20 border border-transparent hover:border-secondary group"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-secondary/20 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {product.widthCm}x{product.heightCm}cm · ${product.price.toFixed(2)}
                          </p>
                        </div>
                        {/* Add icon */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                            <Plus width={12} height={12} className="text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Items on Canvas */}
      <div className="border-t flex-shrink-0" style={{ maxHeight: "40%" }}>
        <div className="p-3 bg-background border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">On Canvas</h2>
            <Badge variant="secondary" className="text-[10px]">
              {canvasItems.length}
            </Badge>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 44px)" }}>
          {canvasItems.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No items yet. Click products above to add them.
              </p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {canvasItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                    selectedItemId === item.id
                      ? "bg-secondary/20 border border-accent"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {/* Mini thumbnail */}
                  <div className="w-8 h-8 rounded overflow-hidden bg-secondary/20 flex-shrink-0">
                    {item.product!.imageUrl ? (
                      <img
                        src={item.product!.imageUrl}
                        alt={item.product!.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                        {item.product!.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product!.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      ${item.product!.price.toFixed(2)}
                    </p>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:!opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-all flex-shrink-0"
                    style={{ opacity: selectedItemId === item.id ? 1 : undefined }}
                  >
                    <Trash width={12} height={12} />
                  </button>
                </div>
              ))}
              {/* Total */}
              <div className="px-2 pt-2 pb-1 border-t mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    ${canvasItems.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
