"use client";

import { useSession } from "@/components/providers/SupabaseProvider";
import Link from "next/link";
import {
  Images,
  Pencil,
  Settings,
  LogOut,
  LayoutGrid,
  ChevronDown,
  Package,
  Folder,
  Files,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  variant?: "icon" | "bar" | "sidebar";
  className?: string;
  onNavigate?: (href: string) => void;
}

function MenuNavItem({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate?: (href: string) => void;
  children: React.ReactNode;
}) {
  if (onNavigate) {
    return (
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => onNavigate(href)}
      >
        {children}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <Link href={href} className="cursor-pointer">
        {children}
      </Link>
    </DropdownMenuItem>
  );
}

export function UserMenu({ variant = "icon", className, onNavigate }: UserMenuProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className={cn(
          variant === "sidebar" ? "h-12 w-full animate-pulse rounded-lg bg-white/10" : "size-9 animate-pulse rounded-md bg-muted",
          className
        )}
      />
    );
  }

  if (!session) {
    return (
      <div className={cn("button-group", className)}>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    );
  }

  const user = session.user;
  const isAdmin = user.role?.toUpperCase() === "ADMIN";
  const roleLabel = isAdmin ? "Admin" : "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "bar" ? (
          <Button
            variant="ghost"
            className={cn(
              "motion-interactive h-auto items-center justify-start gap-2 px-0 hover:bg-transparent active:scale-100 data-[state=open]:opacity-80",
              className
            )}
          >
            <UserAvatar id={user.id} name={user.name} email={user.email} className="shrink-0" />
            <div className="hidden min-w-0 flex-col justify-center gap-0.5 text-left lg:flex">
              <span className="truncate text-sm font-medium leading-none text-foreground">
                {user.name || "User"}
              </span>
              <span className="truncate text-xs leading-none text-muted-foreground">{roleLabel}</span>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        ) : variant === "sidebar" ? (
          <Button
            variant="ghost"
            className={cn(
              "motion-interactive h-auto w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 text-sidebar-foreground hover:bg-white/10 active:scale-100 data-[state=open]:bg-white/10",
              className
            )}
          >
            <UserAvatar id={user.id} name={user.name} email={user.email} className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-left">
              <span className="truncate text-sm font-medium leading-none text-sidebar-foreground">
                {user.name || "User"}
              </span>
              <span className="truncate text-xs leading-none text-sidebar-muted-foreground">{roleLabel}</span>
            </div>
            <ChevronDown className="size-4 shrink-0 text-sidebar-muted-foreground" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className={cn("active:scale-100 focus-visible:ring-ring", className)}>
            <UserAvatar id={user.id} name={user.name} email={user.email} size="default" className="size-9" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === "sidebar" ? "start" : "end"}
        side={variant === "sidebar" ? "top" : "bottom"}
        className="w-56"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user.name || "User"}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <>
            <MenuNavItem href="/admin" onNavigate={onNavigate}>
              <LayoutGrid className="size-4" />
              Overview
            </MenuNavItem>
            <MenuNavItem href="/admin/products" onNavigate={onNavigate}>
              <Package className="size-4" />
              Products
            </MenuNavItem>
            <MenuNavItem href="/admin/categories" onNavigate={onNavigate}>
              <Folder className="size-4" />
              Categories
            </MenuNavItem>
            <MenuNavItem href="/admin/templates" onNavigate={onNavigate}>
              <Files className="size-4" />
              Templates
            </MenuNavItem>
            <MenuNavItem href="/admin/users" onNavigate={onNavigate}>
              <Users className="size-4" />
              Users
            </MenuNavItem>
            <DropdownMenuSeparator />
            <MenuNavItem href="/admin/settings" onNavigate={onNavigate}>
              <Shield className="size-4" />
              Admin settings
            </MenuNavItem>
          </>
        ) : (
          <>
            <MenuNavItem href="/dashboard" onNavigate={onNavigate}>
              <LayoutGrid className="size-4" />
              Overview
            </MenuNavItem>
            <MenuNavItem href="/designs" onNavigate={onNavigate}>
              <Images className="size-4" />
              My designs
            </MenuNavItem>
            <MenuNavItem href="/designer" onNavigate={onNavigate}>
              <Pencil className="size-4" />
              New design
            </MenuNavItem>
            <DropdownMenuSeparator />
            <MenuNavItem href="/settings" onNavigate={onNavigate}>
              <Settings className="size-4" />
              Settings
            </MenuNavItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await fetch("/api/auth/signout", {
              method: "POST",
              credentials: "include",
            });
            window.location.replace("/login");
          }}
          className="cursor-pointer"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
