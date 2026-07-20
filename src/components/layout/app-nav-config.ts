import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Images,
  Settings,
  Plus,
  Package,
  Folder,
  Files,
  Users,
  Shield,
} from "lucide-react";

export type AppNavIcon = LucideIcon;

export type AppNavItem = {
  href: string;
  label: string;
  icon: AppNavIcon;
  exact?: boolean;
};

export type AppNavSection = {
  label: string;
  items: AppNavItem[];
};

export const newDesignHref = "/designer";

export function getHomeHref(isAdmin: boolean) {
  return isAdmin ? "/admin" : "/dashboard";
}

const userWorkspaceSection: AppNavSection = {
  label: "Workspace",
  items: [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
    { href: "/designs", label: "My designs", icon: Images },
    { href: newDesignHref, label: "New design", icon: Plus },
    { href: "/settings", label: "Settings", icon: Settings, exact: true },
  ],
};

const adminOverviewSection: AppNavSection = {
  label: "Platform",
  items: [{ href: "/admin", label: "Overview", icon: LayoutGrid, exact: true }],
};

const adminCatalogSection: AppNavSection = {
  label: "Catalog",
  items: [
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Folder },
    { href: "/admin/templates", label: "Templates", icon: Files },
  ],
};

const adminSection: AppNavSection = {
  label: "Admin",
  items: [
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Admin settings", icon: Shield },
  ],
};

/** Role-specific sidebar nav — admins never see the user workspace section. */
export function getNavSections(isAdmin: boolean): AppNavSection[] {
  if (isAdmin) {
    return [adminOverviewSection, adminCatalogSection, adminSection];
  }

  return [userWorkspaceSection];
}

export function getMobileNavItems(isAdmin: boolean): AppNavItem[] {
  if (isAdmin) {
    return [
      { href: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/templates", label: "Templates", icon: Files },
      { href: "/admin/settings", label: "Settings", icon: Shield, exact: true },
    ];
  }

  return [
    { href: "/dashboard", label: "Home", icon: LayoutGrid, exact: true },
    { href: "/designs", label: "Designs", icon: Images },
    { href: "/settings", label: "Settings", icon: Settings, exact: true },
  ];
}

export function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type PageMeta = {
  title: string;
  section?: string;
};

/** Current page label for the top bar */
export function getPageMeta(pathname: string): PageMeta {
  if (pathname === "/dashboard") return { title: "Overview" };
  if (pathname === "/designs") return { title: "My designs" };
  if (pathname.startsWith("/designs/") && pathname.endsWith("/unlock")) {
    return { title: "Unlock links", section: "My designs" };
  }
  if (pathname.startsWith("/designs/") && pathname.endsWith("/links")) {
    return { title: "Shopping links", section: "My designs" };
  }
  if (pathname.startsWith("/designs/")) return { title: "Design", section: "My designs" };
  if (pathname === "/settings") return { title: "Settings" };
  if (pathname.startsWith("/designer")) return { title: "Designer" };
  if (pathname === "/admin") return { title: "Overview", section: "Platform" };
  if (pathname === "/admin/products") return { title: "Products", section: "Catalog" };
  if (pathname === "/admin/categories") return { title: "Categories", section: "Catalog" };
  if (pathname === "/admin/templates") return { title: "Templates", section: "Catalog" };
  if (pathname === "/admin/users") return { title: "Users", section: "Admin" };
  if (pathname === "/admin/settings") return { title: "Admin settings", section: "Admin" };
  return { title: "Overview" };
}

/** Flat list of nav items for title lookup */
export function getAllNavItems(isAdmin: boolean): AppNavItem[] {
  return getNavSections(isAdmin).flatMap((s) => s.items);
}
