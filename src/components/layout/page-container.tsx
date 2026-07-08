import { cn } from "@/lib/utils";

type PageContainerSize = "sm" | "md" | "lg";

interface PageContainerProps {
  children: React.ReactNode;
  size?: PageContainerSize;
  className?: string;
  as?: "main" | "div";
}

const sizeClasses: Record<PageContainerSize, string> = {
  sm: "max-w-4xl",
  md: "max-w-6xl",
  lg: "max-w-7xl",
};

export function PageContainer({
  children,
  size = "lg",
  className,
  as: Tag = "main",
}: PageContainerProps) {
  return (
    <Tag
      className={cn(
        sizeClasses[size],
        "mx-auto px-[var(--spacing-page-x)] py-[var(--spacing-page-y)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
