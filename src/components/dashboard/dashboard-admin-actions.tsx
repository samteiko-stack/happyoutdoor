import Link from "next/link";
import type { ComponentType } from "react";
import { Package, Folder, Files, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Action = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ width?: number; height?: number; className?: string }>;
  primary?: boolean;
};

const ACTIONS: Action[] = [
  {
    href: "/admin/products",
    label: "Products",
    description: "Catalog items",
    icon: Package,
    primary: true,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    description: "Product groups",
    icon: Folder,
  },
  {
    href: "/admin/templates",
    label: "Templates",
    description: "Layouts",
    icon: Files,
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Accounts",
    icon: Users,
  },
];

export function DashboardAdminActions({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={cn(
            "motion-interactive flex flex-col gap-3 rounded-xl border p-4",
            action.primary
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/95"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <action.icon
            width={20}
            height={20}
            className={action.primary ? "text-primary-foreground/80" : "text-primary"}
          />
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                action.primary ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {action.label}
            </p>
            <p
              className={cn(
                "mt-0.5 text-caption",
                action.primary ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
