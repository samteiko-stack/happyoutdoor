"use client";

import { usePathname } from "next/navigation";
import { useSession } from "@/components/providers/SupabaseProvider";
import { UserMenu } from "@/components/UserMenu";
import { getPageMeta } from "./app-nav-config";
import { cn } from "@/lib/utils";

interface AppTopBarProps {
  className?: string;
}

export function AppTopBar({ className }: AppTopBarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { title, section } = getPageMeta(pathname);
  const user = session?.user;
  const subtitle =
    section ??
    user?.name ??
    user?.email?.split("@")[0] ??
    undefined;

  return (
    <header
      className={cn(
        "app-header sticky top-0 z-30 shrink-0 border-b border-border bg-card",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <UserMenu variant="bar" className="shrink-0" />
    </header>
  );
}
