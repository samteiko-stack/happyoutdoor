import Image from "next/image";
import { cn } from "@/lib/utils";

interface SnapshotThumbnailProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  badge?: React.ReactNode;
}

export function SnapshotThumbnail({
  src,
  alt,
  className,
  fallback,
  badge,
}: SnapshotThumbnailProps) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden bg-surface-subtle",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain object-center"
          sizes="(max-width: 640px) 100vw, 240px"
        />
      ) : (
        fallback
      )}
      {badge ? <div className="absolute left-2.5 top-2.5">{badge}</div> : null}
    </div>
  );
}
