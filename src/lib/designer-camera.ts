import type { CanvasItem } from "@/lib/designer-store";

const CM = 0.01;

/** Default isometric azimuth — matches snapshot / front-right viewing angle. */
const ISO_AZIMUTH = Math.PI / 4;

/** Camera yaw (radians) so the view stays on the product's front side as it rotates. */
export function itemCameraAzimuth(rotationDeg: number) {
  const yaw = (rotationDeg * Math.PI) / 180;
  return ISO_AZIMUTH - yaw;
}

/** Convert plan-canvas item coords to 3D world position (matches IsometricScene). */
export function itemToWorldPosition(
  item: CanvasItem,
  balconyWidthCm: number,
  balconyHeightCm: number
) {
  const roomW = balconyWidthCm * CM;
  const roomD = balconyHeightCm * CM;
  const floorY = (item.height ?? 0) * CM;
  return {
    x: (item.x / 2) * CM - roomW / 2,
    // Aim at product mid-height so framing feels centered
    y: floorY + 0.35,
    z: (item.y / 2) * CM - roomD / 2,
  };
}

export function overviewCameraFocus(balconyWidthCm: number, balconyHeightCm: number) {
  const maxDim = Math.max(balconyWidthCm, balconyHeightCm) * CM;
  return {
    target: [0, 0.55, 0] as [number, number, number],
    distance: maxDim * 3.5,
    absoluteTheta: ISO_AZIMUTH,
  };
}

export function itemCameraFocus(
  item: CanvasItem,
  balconyWidthCm: number,
  balconyHeightCm: number,
  options: {
    /** Multiplier of balcony max dim. Lower = closer. */
    distanceFactor?: number;
    /** Relative yaw orbit (radians) applied once when focus is set. */
    orbitDelta?: number;
    /** Override auto azimuth from item rotation. */
    absoluteTheta?: number;
  } = {}
) {
  const { distanceFactor = 1.45, orbitDelta, absoluteTheta } = options;
  const maxDim = Math.max(balconyWidthCm, balconyHeightCm) * CM;
  const pos = itemToWorldPosition(item, balconyWidthCm, balconyHeightCm);
  return {
    target: [pos.x, pos.y, pos.z] as [number, number, number],
    distance: Math.max(maxDim * 1.15, maxDim * distanceFactor),
    absoluteTheta: absoluteTheta ?? itemCameraAzimuth(item.rotation),
    ...(orbitDelta != null ? { orbitDelta } : {}),
  };
}
