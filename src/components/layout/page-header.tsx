import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  size?: "display" | "heading-1" | "heading-2";
  className?: string;
}

const titleClasses = {
  display: "text-display",
  "heading-1": "text-heading-1",
  "heading-2": "text-heading-2",
} as const;

export function PageHeader({
  title,
  description,
  actions,
  size = "heading-1",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 mb-[var(--spacing-section)]",
        className
      )}
    >
      <div>
        <h1 className={cn(titleClasses[size], "mb-2")}>{title}</h1>
        {description && <p className="text-body-lg">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
