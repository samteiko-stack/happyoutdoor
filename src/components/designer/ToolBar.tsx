"use client";

import {
  Undo2,
  Redo2,
  RotateCcw,
  RotateCw,
  Trash2,
  Minus,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import { useDesignerStore } from "@/lib/designer-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ToolBar() {
  const {
    selectedItemId,
    deleteItem,
    rotateSelected,
    undo,
    redo,
    historyIndex,
    history,
    items,
    balconyWidthCm,
    balconyHeightCm,
    setBalconySize,
    timeOfDay,
    setTimeOfDay,
  } = useDesignerStore();

  return (
    <div className="designer-toolbar">
      <div className="designer-toolbar-group">
        <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex < 0} title="Undo">
          <Undo2 className="size-4" strokeWidth={1.75} />
          <span className="ml-1 text-xs">Undo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <Redo2 className="size-4" strokeWidth={1.75} />
          <span className="ml-1 text-xs">Redo</span>
        </Button>
      </div>

      <div className="designer-toolbar-group">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => rotateSelected(-45)}
          disabled={!selectedItemId}
          title="Rotate left"
          data-demo="toolbar-rotate-ccw"
        >
          <RotateCcw className="size-4" strokeWidth={1.75} />
          <span className="ml-1 text-xs">-45°</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => rotateSelected(45)}
          disabled={!selectedItemId}
          title="Rotate right"
          data-demo="toolbar-rotate-cw"
        >
          <RotateCw className="size-4" strokeWidth={1.75} />
          <span className="ml-1 text-xs">+45°</span>
        </Button>
        <Button
          variant="ghost-destructive"
          size="sm"
          onClick={() => selectedItemId && deleteItem(selectedItemId)}
          disabled={!selectedItemId}
          title="Delete selected"
        >
          <Trash2 className="size-4" strokeWidth={1.75} />
          <span className="ml-1 text-xs">Delete</span>
        </Button>
      </div>

      <div className="designer-view-toggle" role="group" aria-label="Time of day">
        <button
          type="button"
          onClick={() => setTimeOfDay("day")}
          data-demo="toolbar-day"
          className={cn(
            "designer-view-toggle-item",
            timeOfDay === "day" && "designer-view-toggle-item-active"
          )}
        >
          <Sun className="size-3.5" strokeWidth={1.75} />
          Day
        </button>
        <button
          type="button"
          onClick={() => setTimeOfDay("night")}
          data-demo="toolbar-night"
          className={cn(
            "designer-view-toggle-item",
            timeOfDay === "night" && "designer-view-toggle-item-active"
          )}
        >
          <Moon className="size-3.5" strokeWidth={1.75} />
          Night
        </button>
      </div>

      <div className="designer-toolbar-dimensions">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-foreground">Width</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setBalconySize(Math.max(150, balconyWidthCm - 50), balconyHeightCm)
              }
              disabled={balconyWidthCm <= 150}
              className="size-7 p-0"
            >
              <Minus className="size-3.5" strokeWidth={2} />
            </Button>
            <span className="w-14 text-center text-sm font-semibold tabular-nums text-foreground">
              {balconyWidthCm}cm
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setBalconySize(Math.min(600, balconyWidthCm + 50), balconyHeightCm)
              }
              disabled={balconyWidthCm >= 600}
              className="size-7 p-0"
            >
              <Plus className="size-3.5" strokeWidth={2} />
            </Button>
          </div>
        </div>

        <div className="h-6 w-px bg-border" aria-hidden />

        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-foreground">Depth</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setBalconySize(balconyWidthCm, Math.max(100, balconyHeightCm - 50))
              }
              disabled={balconyHeightCm <= 100}
              className="size-7 p-0"
            >
              <Minus className="size-3.5" strokeWidth={2} />
            </Button>
            <span className="w-14 text-center text-sm font-semibold tabular-nums text-foreground">
              {balconyHeightCm}cm
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setBalconySize(balconyWidthCm, Math.min(400, balconyHeightCm + 50))
              }
              disabled={balconyHeightCm >= 400}
              className="size-7 p-0"
            >
              <Plus className="size-3.5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium tabular-nums text-foreground">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
