import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { cn } from "@/lib/utils";

interface AdminProductCardProps {
  name: string;
  categoryName?: string | null;
  imageUrl?: string | null;
  topViewImageUrl?: string | null;
  widthCm: number;
  heightCm: number;
  className?: string;
}

export function AdminProductCard({
  name,
  categoryName,
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
          <Badge variant="secondary" className="w-fit">
            {categoryName}
          </Badge>
        ) : null}
        <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-caption text-muted-foreground">
          {widthCm} × {heightCm} cm
        </p>
      </div>
    </Link>
  );
}
