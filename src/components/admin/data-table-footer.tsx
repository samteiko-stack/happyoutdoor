"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableFooterProps {
  total: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function DataTableFooter({
  total,
  page,
  pageSize,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: DataTableFooterProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "table-footer flex flex-wrap items-center justify-between gap-3 border-t border-border px-[var(--spacing-page-x)] py-3 text-sm text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span>
          Showing {start}–{end} of {total}
        </span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[4.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="active:scale-100"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-[3rem] text-center tabular-nums">
          {page}/{totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="active:scale-100"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function useTablePagination<T>(items: T[], initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const setPageSizeSafe = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page: safePage,
    pageSize,
    pagedItems,
    setPage,
    setPageSize: setPageSizeSafe,
    total: items.length,
  };
}
