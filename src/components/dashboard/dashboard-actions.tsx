import Link from "next/link";
import type { ComponentType } from "react";
import { Images, Plus, Settings, Scaling } from "lucide-react";
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
    href: "/designer",
    label: "New design",
    description: "Blank canvas",
    icon: Plus,
    primary: true,
  },
  {
    href: "/designer?w=300&h=200",
    label: "Standard size",
    description: "300 × 200 cm",
    icon: Scaling,
  },
  {
    href: "/designs",
    label: "My designs",
    description: "Open & edit",
    icon: Images,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Account",
    icon: Settings,
  },
];

export function DashboardActions({ className }: { className?: string }) {
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
