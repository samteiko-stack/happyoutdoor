import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { cn } from "@/lib/utils";

interface AdminProductCardProps {
  name: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  imageUrl?: string | null;
  topViewImageUrl?: string | null;
  widthCm: number;
  heightCm: number;
  className?: string;
}

export function AdminProductCard({
  name,
  categoryName,
  categorySlug,
  imageUrl,
  topViewImageUrl,
  widthCm,
  heightCm,
  className,
}: AdminProductCardProps) {
  return (
    <Link
      href="/admin/products"
      className={cn(
        "motion-interactive group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
        "hover:border-primary/25",
        className
      )}
    >
      <div className="flex aspect-square items-center justify-center bg-surface-subtle p-5">
        <ProductThumbnail
          name={name}
          imageUrl={imageUrl}
          topViewImageUrl={topViewImageUrl}
          className="size-24 rounded-lg"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        {categoryName ? (
          <CategoryBadge name={categoryName} slug={categorySlug} className="w-fit" />
        ) : null}
        <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-caption text-muted-foreground">
          {widthCm} × {heightCm} cm
        </p>
      </div>
    </Link>
  );
}
