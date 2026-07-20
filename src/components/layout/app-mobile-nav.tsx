"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/providers/SupabaseProvider";
import {
  getMobileNavItems,
  newDesignHref,
  isNavActive,
} from "./app-nav-config";

export function AppMobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === "ADMIN";
  const items = getMobileNavItems(isAdmin);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden">
      <ul className="mx-auto flex h-[var(--spacing-mobile-nav-height)] max-w-lg items-stretch">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href, item.exact);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex flex-1 items-center justify-center">
              <Link
                href={item.href}
                className={cn(
                  "motion-interactive flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium",
                  active ? "text-primary" : "text-foreground/70"
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} />
                <span className="max-w-[4.5rem] truncate text-center">{item.label}</span>
              </Link>
            </li>
          );
        })}
        {!isAdmin && (
          <li className="flex flex-1 items-center justify-center">
            <Link
              href={newDesignHref}
              aria-label="New design"
              className="motion-interactive flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <Plus className="size-5" strokeWidth={2} />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
