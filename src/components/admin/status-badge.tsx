import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "draft"
  | "paid"
  | "unlocked"
  | "published"
  | "unpublished"
  | "admin"
  | "user"
  | "neutral";

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

const statusConfig: Record<
  StatusVariant,
  { variant: "default" | "secondary" | "outline" | "draft" | "unlocked" | "neutral"; label: string }
> = {
  draft: { variant: "draft", label: "Draft" },
  paid: { variant: "default", label: "Paid" },
  unlocked: { variant: "unlocked", label: "Unlocked" },
  published: { variant: "default", label: "Published" },
  unpublished: { variant: "secondary", label: "Unpublished" },
  admin: { variant: "default", label: "Admin" },
  user: { variant: "secondary", label: "User" },
  neutral: { variant: "neutral", label: "Neutral" },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {label ?? config.label}
    </Badge>
  );
}
