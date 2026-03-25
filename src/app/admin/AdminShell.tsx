"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ViewGrid, Package, Folder, MultiplePages, Group, Settings, LogOut } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Session } from "next-auth";

const navItems = [
  { href: "/admin", label: "Overview", icon: ViewGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/templates", label: "Templates", icon: MultiplePages },
  { href: "/admin/users", label: "Users", icon: Group },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ session, children }: { session: Session | null; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border bg-white">
        <div className="p-6">
          <h2 className="font-semibold text-foreground text-lg">Happy Balcony</h2>
          <p className="text-primary text-sm">Admin Panel</p>
        </div>
        <Separator className="bg-border" />
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary/20 text-foreground"
                    : "text-primary hover:bg-secondary/10 hover:text-foreground"
                }`}
              >
                <item.icon className="shrink-0" width={20} height={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
          <h1 className="font-semibold text-foreground text-xl">Admin Panel</h1>
          <div className="flex items-center gap-3">
            {session?.user && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {(session.user.name || session.user.email || "A")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">
                    {session.user.name || "Admin"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
              </div>
            )}
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut width={16} height={16} />
              Sign out
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
