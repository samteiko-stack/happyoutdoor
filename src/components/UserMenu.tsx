"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { MediaImageList, DesignPencil, Settings, DashboardDots, LogOut, NavArrowDown } from "iconoir-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
        </Link>
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || "U";
  const isAdmin = (user as { role?: string }).role === "ADMIN";

  // Generate a cute avatar based on user's email for consistency
  const avatarSeed = user.email || user.name || "default";
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=cadc82,a7b500,faf8ea&radius=50`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={user.name || "User"} />
            <AvatarFallback className="bg-accent/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
            {user.name || user.email}
          </span>
          <NavArrowDown width={14} height={14} className="text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user.name || "User"}</span>
            <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/designs" className="cursor-pointer">
            <MediaImageList width={16} height={16} className="mr-2" />
            My Designs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/designer" className="cursor-pointer">
            <DesignPencil width={16} height={16} className="mr-2" />
            New Design
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings width={16} height={16} className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <DashboardDots width={16} height={16} className="mr-2" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut width={16} height={16} className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
