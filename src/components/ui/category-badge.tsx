import type { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const categoryBadgeVariants: Record<string, BadgeVariant> = {
  seating: "warm",
  tables: "clay",
  lighting: "gold",
  plants: "fern",
  planters: "clay",
  decor: "warm",
};

export function getCategoryBadgeVariant(slug?: string | null): BadgeVariant {
  if (!slug) return "sage";
  return categoryBadgeVariants[slug] ?? "sage";
}

export function CategoryBadge({
  name,
  slug,
  className,
}: {
  name: string;
  slug?: string | null;
  className?: string;
}) {
  return (
    <Badge variant={getCategoryBadgeVariant(slug)} className={className}>
      {name}
    </Badge>
  );
}
