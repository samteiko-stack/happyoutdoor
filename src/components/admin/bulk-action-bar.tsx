"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Download, Copy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkActionItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
}

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  actions?: BulkActionItem[];
  onDelete?: () => void;
  deleteLabel?: string;
  className?: string;
}

function BulkBarButton({
  label,
  icon: Icon,
  destructive,
  onClick,
}: BulkActionItem) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "motion-interactive inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
        destructive
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          : "border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  );
}

export function BulkActionBar({
  count,
  onClear,
  actions = [],
  onDelete,
  deleteLabel = "Delete",
  className,
}: BulkActionBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || count === 0) return null;

  const destructiveAction: BulkActionItem | null = onDelete
    ? { label: deleteLabel, icon: Trash2, onClick: onDelete, destructive: true }
    : null;

  const allActions = [...actions, ...(destructiveAction ? [destructiveAction] : [])];

  return createPortal(
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4",
        "top-[calc(var(--spacing-header-height)+0.75rem)]",
        className
      )}
    >
      <div
        className={cn(
          "motion-enter motion-surface pointer-events-auto flex max-w-full items-center gap-1 rounded-lg bg-foreground px-2 py-1.5 ring-1 ring-primary-foreground/10"
        )}
      >
        <button
          type="button"
          onClick={onClear}
          className="motion-interactive inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
        >
          <X className="size-4 shrink-0" />
          <span className="whitespace-nowrap">
            {count} {count === 1 ? "item" : "items"} selected
          </span>
        </button>

        {allActions.length > 0 && (
          <>
            <div
              className="mx-1 h-6 w-px shrink-0 bg-primary-foreground/15"
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-1">
              {allActions.map((action) => (
                <BulkBarButton key={action.label} {...action} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export const bulkActionPresets = {
  export: (onClick: () => void): BulkActionItem => ({
    label: "Export",
    icon: Download,
    onClick,
  }),
  duplicate: (onClick: () => void): BulkActionItem => ({
    label: "Duplicate",
    icon: Copy,
    onClick,
  }),
};
