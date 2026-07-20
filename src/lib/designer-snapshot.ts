import type { CanvasItem } from "@/lib/designer-store";

export type DesignSnapshotInput = {
  designName: string;
  balconyWidthCm: number;
  balconyHeightCm: number;
  items: CanvasItem[];
};

function normalizeItems(items: CanvasItem[]) {
  return [...items]
    .map(({ productId, x, y, rotation, scaleX, scaleY, height }) => ({
      productId,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      rotation: Math.round(rotation * 10) / 10,
      scaleX,
      scaleY,
      height: height ?? null,
    }))
    .sort(
      (a, b) =>
        a.productId.localeCompare(b.productId) || a.x - b.x || a.y - b.y
    );
}

export function createDesignSnapshot(input: DesignSnapshotInput) {
  return JSON.stringify({
    designName: input.designName.trim(),
    balconyWidthCm: input.balconyWidthCm,
    balconyHeightCm: input.balconyHeightCm,
    items: normalizeItems(input.items),
  });
}

export function isDesignDirty(current: DesignSnapshotInput, baseline: string) {
  return createDesignSnapshot(current) !== baseline;
}
