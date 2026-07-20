"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DataTableToolbar } from "./data-table-toolbar";
import { BulkActionBar, type BulkActionItem } from "./bulk-action-bar";
import { DataTableFooter } from "./data-table-footer";
import type { TableSelection } from "./use-table-selection";

interface DataTableCardProps {
  columns: string[];
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selection?: TableSelection;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  primaryAction?: React.ReactNode;
  onBulkDelete?: () => void;
  bulkDeleteLabel?: string;
  bulkActions?: BulkActionItem[];
  footer?: {
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  className?: string;
}

function TableCheckboxCell({ children }: { children: React.ReactNode }) {
  return (
    <TableCell className="table-checkbox-cell">
      <div className="flex size-4 items-center justify-center">{children}</div>
    </TableCell>
  );
}

function TableCheckboxHead({ children }: { children: React.ReactNode }) {
  return (
    <TableHead className="table-checkbox-cell">
      <div className="flex size-4 items-center justify-center">{children}</div>
    </TableHead>
  );
}

export function DataTableCard({
  columns,
  children,
  isEmpty = false,
  emptyMessage = "No results",
  selectable = true,
  selection,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  primaryAction,
  onBulkDelete,
  bulkDeleteLabel,
  bulkActions,
  footer,
  className,
}: DataTableCardProps) {
  const hasToolbar =
    onSearchChange !== undefined ||
    filters ||
    primaryAction;

  const tableBodyMinHeight = footer
    ? `calc(var(--spacing-table-row-min) * ${footer.pageSize})`
    : undefined;

  return (
    <Card className={cn("overflow-hidden rounded-xl border-border", className)}>
      {hasToolbar && (
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          primaryAction={primaryAction}
        />
      )}

      {selectable && selection && selection.selectedCount > 0 && (
        <BulkActionBar
          count={selection.selectedCount}
          onClear={selection.clear}
          actions={bulkActions}
          onDelete={onBulkDelete}
          deleteLabel={bulkDeleteLabel}
        />
      )}

      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto [scrollbar-gutter:stable]"
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableCheckboxHead>
                  {selection ? (
                    <Checkbox
                      checked={
                        selection.allSelected
                          ? true
                          : selection.someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={selection.toggleAll}
                      aria-label="Select all rows"
                    />
                  ) : null}
                </TableCheckboxHead>
              )}
              {columns.map((col, index) => (
                <TableHead key={index}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody style={{ minHeight: tableBodyMinHeight }}>
            {isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-auto py-16 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </div>

      {footer && (
        <DataTableFooter
          total={footer.total}
          page={footer.page}
          pageSize={footer.pageSize}
          onPageChange={footer.onPageChange}
          onPageSizeChange={footer.onPageSizeChange}
        />
      )}
    </Card>
  );
}

interface TableRowDefaultProps extends React.ComponentProps<typeof TableRow> {
  rowId?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function TableRowDefault({
  rowId,
  selected,
  onSelect,
  className,
  children,
  ...props
}: TableRowDefaultProps) {
  return (
    <TableRow
      data-state={selected ? "selected" : undefined}
      className={className}
      {...props}
    >
      {onSelect !== undefined && (
        <TableCheckboxCell>
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            aria-label={rowId ? `Select row ${rowId}` : "Select row"}
          />
        </TableCheckboxCell>
      )}
      {children}
    </TableRow>
  );
}

export function TableCellActions({ children }: { children: React.ReactNode }) {
  return (
    <TableCell className="table-actions-cell text-right">
      <div className="flex justify-end">{children}</div>
    </TableCell>
  );
}
