import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductThumbnailProps {
  name: string;
  imageUrl?: string | null;
  topViewImageUrl?: string | null;
  className?: string;
}

export function ProductThumbnail({
  name,
  imageUrl,
  topViewImageUrl,
  className,
}: ProductThumbnailProps) {
  const src = imageUrl || topViewImageUrl;

  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-contain p-1" />
      ) : (
        <Package className="size-4 text-muted-foreground" strokeWidth={1.75} />
      )}
    </div>
  );
}
