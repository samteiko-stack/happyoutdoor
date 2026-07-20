import { AppSidebar } from "./app-sidebar";
import { AppMobileNav } from "./app-mobile-nav";
import { AppTopBar } from "./app-top-bar";
import { AppMobileHeader } from "./app-mobile-header";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/** Standard app shell: sidebar + top bar on desktop, header + bottom nav on mobile. */
export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="app-canvas">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppMobileHeader />
        <AppTopBar className="hidden md:flex" />

        <main
          className={cn(
            "app-main page-content flex-1 overflow-auto",
            "pb-[calc(var(--spacing-mobile-nav-height)+var(--spacing-page-y))] md:pb-[var(--spacing-page-y)]",
            className
          )}
        >
          {children}
        </main>

        <AppMobileNav />
      </div>
    </div>
  );
}

/** @deprecated Use AppLayout */
export const AppSidebarLayout = AppLayout;
