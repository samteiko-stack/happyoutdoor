import sharp from "sharp";

const SIZE = 1024;
const BG = "#F0EFEB";
const FLOOR = "#E8E6E0";
const WALL = "#FFFFFF";
const WALL_EDGE = "#D4D2CC";
const ITEM = "#C4A882";
const ITEM_EDGE = "#A88862";

type LayoutItem = {
  x: number;
  y: number;
  productId?: string;
};

function parseLayoutItems(layoutData: string | null | undefined): LayoutItem[] {
  if (!layoutData) return [];
  try {
    const parsed = JSON.parse(layoutData) as LayoutItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Plan cm from designer pixel coords (1 cm = 2 px). */
function toCm(value: number) {
  return value / 2;
}

function isoPoint(cmX: number, cmY: number, scale: number, cx: number, cy: number) {
  const x = (cmX - cmY) * 0.866 * scale;
  const y = (cmX + cmY) * 0.5 * scale;
  return { x: cx + x, y: cy + y };
}

function polygon(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function itemColor(productId: string | undefined, index: number) {
  if (!productId) return ITEM;
  let hash = index;
  for (let i = 0; i < productId.length; i += 1) {
    hash = (hash + productId.charCodeAt(i) * (i + 1)) % 360;
  }
  const hue = 25 + (hash % 40);
  return `hsl(${hue}, 28%, 62%)`;
}

export function buildTemplateThumbnailSvg(input: {
  balconyWidthCm: number;
  balconyHeightCm: number;
  layoutData: string | null | undefined;
}) {
  const { balconyWidthCm, balconyHeightCm } = input;
  const items = parseLayoutItems(input.layoutData);
  const scale = Math.min(680 / balconyWidthCm, 680 / balconyHeightCm);
  const cx = SIZE / 2;
  const cy = SIZE / 2 + 40;

  const floor = [
    isoPoint(0, 0, scale, cx, cy),
    isoPoint(balconyWidthCm, 0, scale, cx, cy),
    isoPoint(balconyWidthCm, balconyHeightCm, scale, cx, cy),
    isoPoint(0, balconyHeightCm, scale, cx, cy),
  ];

  const backWall = [
    floor[3]!,
    floor[2]!,
    { x: floor[2]!.x, y: floor[2]!.y - 88 },
    { x: floor[3]!.x, y: floor[3]!.y - 88 },
  ];

  const leftWall = [
    floor[0]!,
    floor[3]!,
    { x: floor[3]!.x, y: floor[3]!.y - 88 },
    { x: floor[0]!.x, y: floor[0]!.y - 88 },
  ];

  const itemShapes = items
    .map((item, index) => {
      const cmX = toCm(item.x);
      const cmY = toCm(item.y);
      const base = isoPoint(cmX, cmY, scale, cx, cy);
      const w = 22;
      const h = 14;
      const top = { x: base.x, y: base.y - 26 };
      const fill = itemColor(item.productId, index);

      const box = [
        base,
        { x: base.x + w, y: base.y + h * 0.35 },
        { x: base.x + w - 4, y: base.y + h * 0.35 - 18 },
        { x: base.x - 4, y: base.y - 18 },
      ];

      return `
        <polygon points="${polygon(box)}" fill="${fill}" stroke="${ITEM_EDGE}" stroke-width="1"/>
        <polygon points="${polygon([top, { x: top.x + w - 4, y: top.y + h * 0.35 - 18 }, { x: base.x + w - 4, y: base.y + h * 0.35 - 18 }, { x: base.x - 4, y: base.y - 18 }])}" fill="${fill}" opacity="0.92"/>
      `;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
  <polygon points="${polygon(leftWall)}" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1"/>
  <polygon points="${polygon(backWall)}" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1"/>
  <polygon points="${polygon(floor)}" fill="${FLOOR}" stroke="${WALL_EDGE}" stroke-width="1"/>
  ${itemShapes}
</svg>`;
}

export async function renderTemplateThumbnailJpeg(input: {
  balconyWidthCm: number;
  balconyHeightCm: number;
  layoutData: string | null | undefined;
}) {
  const svg = buildTemplateThumbnailSvg(input);
  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
}
