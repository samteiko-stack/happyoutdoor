import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Images } from "lucide-react";

const actions = [
  {
    href: "/designer",
    title: "New design",
    description: "Blank canvas, your rules",
    icon: Plus,
    accent: "from-primary to-brand-moss-dark",
  },
  {
    href: "/designs",
    title: "My designs",
    description: "Pick up where you left off",
    icon: Images,
    accent: "from-foreground to-foreground",
  },
  {
    href: "/settings",
    title: "Account",
    description: "Profile & preferences",
    icon: Pencil,
    accent: "from-muted-foreground to-muted-foreground",
  },
] as const;

export function DashboardQuickActions({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5"
        >
          <div
            className={cn(
              "mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground",
              action.accent
            )}
          >
            <action.icon width={20} height={20} />
          </div>
          <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
            {action.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}
