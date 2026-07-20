"use client";

import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { Logo } from "@/components/Logo";
import { useSession } from "@/components/providers/SupabaseProvider";
import { usePathname } from "next/navigation";
import { getHomeHref, getPageMeta } from "./app-nav-config";

export function AppMobileHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === "ADMIN";
  const { title, section } = getPageMeta(pathname);
  const subtitle = section ?? session?.user?.name;

  return (
    <header className="sticky top-0 z-30 flex shrink-0 flex-col border-b border-border bg-card md:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-[var(--spacing-page-x)]">
        <Link href={getHomeHref(isAdmin)} className="inline-flex shrink-0">
          <Logo variant="dark" width={108} height={40} />
        </Link>
        <UserMenu variant="icon" />
      </div>
      <div className="border-t border-border/70 px-[var(--spacing-page-x)] py-2.5">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
