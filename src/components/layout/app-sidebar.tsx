"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { useSession } from "@/components/providers/SupabaseProvider";
import { cn } from "@/lib/utils";
import { getNavSections, getHomeHref, newDesignHref, isNavActive } from "./app-nav-config";

const PulseDots = dynamic(
  () => import("./pulse-dots").then((mod) => ({ default: mod.PulseDots })),
  { ssr: false }
);

function SidebarNavSkeleton() {
  return (
    <div className="space-y-6 px-3 py-5 motion-fade" aria-hidden>
      {[0, 1].map((section) => (
        <div key={section} className="space-y-2">
          <div className="mx-3 h-2.5 w-16 rounded bg-white/10" />
          <div className="space-y-1">
            {[0, 1, 2].map((item) => (
              <div key={item} className="mx-1 h-10 rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin =
    user?.role?.toUpperCase() === "ADMIN" ||
    (status === "loading" && pathname.startsWith("/admin"));
  const navReady = status !== "loading";
  const sections = getNavSections(isAdmin);

  return (
    <aside className="app-sidebar hidden md:flex w-[var(--spacing-sidebar-width)] shrink-0 flex-col text-sidebar-foreground">
      <PulseDots />

      <div className="px-5 pt-7 pb-5">
        <Link href={getHomeHref(isAdmin)} className="inline-flex">
          <Logo variant="light" size="sidebar" />
        </Link>
      </div>

      {!isAdmin && navReady && (
        <div className="px-4">
          <Button
            asChild
            className="w-full justify-center bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Link href={newDesignHref}>
              <Plus className="size-4" />
              New design
            </Link>
          </Button>
        </div>
      )}

      {navReady ? (
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isNavActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "sidebar-nav-item motion-interactive flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
                          active && "sidebar-nav-item-active"
                        )}
                      >
                        <Icon className="size-[17px] shrink-0" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      ) : (
        <SidebarNavSkeleton />
      )}

      <div className="sidebar-footer mt-auto shrink-0 border-t border-white/10 p-3">
        <UserMenu variant="sidebar" />
      </div>
    </aside>
  );
}
