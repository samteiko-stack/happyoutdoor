"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  primaryAction?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  primaryAction,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "table-toolbar flex flex-wrap items-center gap-2 border-b border-border bg-card px-[var(--spacing-page-x)] py-3",
        className
      )}
    >
      <div className="relative min-w-0 w-full sm:w-auto sm:min-w-[14rem] sm:max-w-sm sm:flex-1">
        <Search
          width={16}
          height={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {filters}
        {primaryAction}
      </div>
    </div>
  );
}
