"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  icon?: "edit" | "delete" | "open";
};

interface RowActionsProps {
  items: RowAction[];
}

const icons = {
  edit: Pencil,
  delete: Trash2,
  open: ExternalLink,
} as const;

export function RowActions({ items }: RowActionsProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Actions"
          className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-100"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-44">
        {items.map((item, index) => {
          const Icon = item.icon ? icons[item.icon] : null;
          const isDestructive = item.destructive;
          const showSeparator =
            isDestructive && index > 0 && !items[index - 1]?.destructive;

          const content = (
            <>
              {Icon && <Icon className="size-4" />}
              {item.label}
            </>
          );

          return (
            <div key={`${item.label}-${index}`}>
              {showSeparator && <DropdownMenuSeparator />}
              {item.href ? (
                <DropdownMenuItem asChild variant={isDestructive ? "destructive" : "default"}>
                  <Link href={item.href}>{content}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant={isDestructive ? "destructive" : "default"}
                  onClick={item.onClick}
                >
                  {content}
                </DropdownMenuItem>
              )}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Right-aligned actions cell for table rows */
export function TableActionsCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="table-actions-cell px-4 py-3 text-right align-middle">
      <div className="flex justify-end">{children}</div>
    </td>
  );
}
