"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getHomeHref } from "@/components/layout/app-nav-config";
import { getDesignLinksHref, getDesignUnlockHref } from "@/lib/design-unlock";
import {
  ArrowLeft,
  Box,
  LayoutGrid,
  Pencil,
  Save,
} from "lucide-react";
import type { ViewMode } from "@/lib/designer-store";

interface DesignerHeaderProps {
  designName: string;
  designId?: string | null;
  isPaid?: boolean;
  onDesignNameChange: (name: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSave: () => void;
  saving: boolean;
  isAdmin: boolean;
  saveLabel: string;
  isDirty?: boolean;
  onNavigate: (href: string) => void;
}

export function DesignerHeader({
  designName,
  designId,
  isPaid = false,
  onDesignNameChange,
  viewMode,
  onViewModeChange,
  onSave,
  saving,
  isAdmin,
  saveLabel,
  isDirty = false,
  onNavigate,
}: DesignerHeaderProps) {
  const [editingName, setEditingName] = useState(false);
  const homeHref = getHomeHref(isAdmin);

  return (
    <header className="designer-header">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate(homeHref)}
          className="motion-interactive shrink-0 opacity-95 hover:opacity-100"
        >
          <Logo variant="dark" width={118} height={42} />
        </button>

        <div className="hidden h-6 w-px bg-border sm:block" />

        <button
          type="button"
          onClick={() => onNavigate(homeHref)}
          className="designer-header-link motion-interactive hidden items-center gap-1.5 sm:inline-flex"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back
        </button>

        <div className="hidden h-6 w-px bg-border md:block" />

        {editingName ? (
          <Input
            value={designName}
            onChange={(e) => onDesignNameChange(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            className="h-9 w-52 max-w-[40vw] border-border bg-background"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="designer-header-name-btn motion-interactive group flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-1.5"
          >
            <span className="designer-header-name text-base font-semibold">{designName}</span>
            {isDirty ? (
              <Badge variant="draft" className="motion-fade shrink-0">
                Unsaved
              </Badge>
            ) : null}
            <Pencil
              className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={1.75}
            />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="designer-view-toggle hidden sm:flex" role="group" aria-label="View mode">
          <button
            type="button"
            onClick={() => onViewModeChange("perspective")}
            className={cn(
              "designer-view-toggle-item",
              viewMode === "perspective" && "designer-view-toggle-item-active"
            )}
          >
            <Box className="size-3.5" strokeWidth={1.75} />
            3D
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("topView")}
            className={cn(
              "designer-view-toggle-item",
              viewMode === "topView" && "designer-view-toggle-item-active"
            )}
          >
            <LayoutGrid className="size-3.5" strokeWidth={1.75} />
            Plan
          </button>
        </div>

        <div className="hidden h-6 w-px bg-border sm:block" aria-hidden />

        {designId && (
          <Button
            type="button"
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() =>
              onNavigate(isPaid ? getDesignLinksHref(designId) : getDesignUnlockHref(designId))
            }
          >
            {isPaid ? "Links" : "Unlock links"}
          </Button>
        )}

        <Button
          onClick={onSave}
          disabled={saving}
          variant="default"
          className={cn(
            "min-w-[9rem] gap-2 font-semibold",
            isDirty && "ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
          )}
        >
          {saving ? (
            <>
              <svg
                className="size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving
            </>
          ) : (
            <>
              <Save className="size-4" strokeWidth={1.75} />
              {saveLabel}
            </>
          )}
        </Button>

        <UserMenu variant="bar" className="hidden lg:flex" onNavigate={onNavigate} />
        <UserMenu variant="icon" className="lg:hidden" onNavigate={onNavigate} />
      </div>
    </header>
  );
}
