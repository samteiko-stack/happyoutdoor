"use client";

import { Undo, Redo, RotateCameraLeft, RotateCameraRight, Trash, Minus, Plus } from "iconoir-react";
import { useDesignerStore } from "@/lib/designer-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

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
    products,
    balconyWidthCm,
    balconyHeightCm,
    setBalconySize,
  } = useDesignerStore();

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price || 0);
  }, 0);

  return (
    <div className="flex items-center gap-1 bg-white border-b px-4 py-2 shadow-sm">
      {/* Undo/Redo */}
      <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex < 0} title="Undo">
        <Undo width={16} height={16} />
        <span className="ml-1 text-xs">Undo</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
        <Redo width={16} height={16} />
        <span className="ml-1 text-xs">Redo</span>
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Item actions */}
      <Button variant="ghost" size="sm" onClick={() => rotateSelected(-45)} disabled={!selectedItemId} title="Rotate left">
        <RotateCameraLeft width={16} height={16} />
        <span className="ml-1 text-xs">-45&deg;</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => rotateSelected(45)} disabled={!selectedItemId} title="Rotate right">
        <RotateCameraRight width={16} height={16} />
        <span className="ml-1 text-xs">+45&deg;</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => selectedItemId && deleteItem(selectedItemId)}
        disabled={!selectedItemId}
        title="Delete selected"
        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
      >
        <Trash width={16} height={16} />
        <span className="ml-1 text-xs">Delete</span>
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* Balcony Size Controls - Modern Arrow Buttons */}
      <div className="flex items-center gap-3 bg-muted/30 rounded px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground">Width</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalconySize(Math.max(150, balconyWidthCm - 50), balconyHeightCm)}
              disabled={balconyWidthCm <= 150}
              className="h-7 w-7 p-0 hover:bg-accent/10"
            >
              <Minus width={14} height={14} />
            </Button>
            <span className="text-sm font-semibold text-foreground w-14 text-center">{balconyWidthCm}cm</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalconySize(Math.min(600, balconyWidthCm + 50), balconyHeightCm)}
              disabled={balconyWidthCm >= 600}
              className="h-7 w-7 p-0 hover:bg-accent/10"
            >
              <Plus width={14} height={14} />
            </Button>
          </div>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground">Depth</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalconySize(balconyWidthCm, Math.max(100, balconyHeightCm - 50))}
              disabled={balconyHeightCm <= 100}
              className="h-7 w-7 p-0 hover:bg-accent/10"
            >
              <Minus width={14} height={14} />
            </Button>
            <span className="text-sm font-semibold text-foreground w-14 text-center">{balconyHeightCm}cm</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalconySize(balconyWidthCm, Math.min(400, balconyHeightCm + 50))}
              disabled={balconyHeightCm >= 400}
              className="h-7 w-7 p-0 hover:bg-accent/10"
            >
              <Plus width={14} height={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="font-medium text-foreground">${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
