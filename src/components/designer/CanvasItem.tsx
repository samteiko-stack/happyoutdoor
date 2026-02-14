"use client";

import { useState, useEffect } from "react";
import { Group, Rect, Text, Image as KonvaImage } from "react-konva";
import { CanvasItem, ProductData } from "@/lib/designer-store";

// Category colors fallback when no image is available
const CATEGORY_COLORS: Record<string, string> = {
  seating: "#7a6b5a",
  lighting: "#d4a843",
  plants: "#6b7f3b",
  planters: "#a67c52",
  decor: "#b8856c",
  tables: "#5a6b52",
};

function useKonvaImage(url: string | null | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = url;
  }, [url]);

  return image;
}

interface CanvasItemComponentProps {
  item: CanvasItem;
  product: ProductData;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

export function CanvasItemComponent({
  item,
  product,
  isSelected,
  scale,
  onSelect,
  onDragEnd,
}: CanvasItemComponentProps) {
  const width = product.widthCm * scale;
  const height = product.heightCm * scale;
  const color = CATEGORY_COLORS[product.category?.slug || "decor"] || "#6B7280";

  // Try top-view image first, then fall back to main image
  const topViewImg = useKonvaImage(product.topViewImageUrl);
  const mainImg = useKonvaImage(product.imageUrl);
  const displayImage = topViewImg || mainImg;

  return (
    <Group
      id={item.id}
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onDragEnd={(e) => {
        onDragEnd(e.target.x(), e.target.y());
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        onDragEnd(node.x(), node.y());
      }}
    >
      {displayImage ? (
        <>
          {/* Rounded clip background */}
          <Rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            cornerRadius={6}
            stroke={isSelected ? "#8fa64a" : "rgba(0,0,0,0.15)"}
            strokeWidth={isSelected ? 2.5 : 1}
            shadowColor={isSelected ? "#8fa64a" : "#000"}
            shadowBlur={isSelected ? 10 : 4}
            shadowOpacity={isSelected ? 0.35 : 0.12}
            fill="#f5f3ed"
          />
          {/* Product image */}
          <KonvaImage
            x={-width / 2 + 2}
            y={-height / 2 + 2}
            width={width - 4}
            height={height - 4}
            image={displayImage}
            cornerRadius={4}
          />
          {/* Label overlay at bottom */}
          <Rect
            x={-width / 2}
            y={height / 2 - 18}
            width={width}
            height={18}
            fill="rgba(45,36,24,0.7)"
            cornerRadius={[0, 0, 6, 6]}
          />
          <Text
            x={-width / 2 + 3}
            y={height / 2 - 16}
            width={width - 6}
            height={14}
            text={product.name}
            fontSize={Math.min(10, width / 6)}
            fill="white"
            fontStyle="500"
            align="center"
            verticalAlign="middle"
            ellipsis={true}
          />
        </>
      ) : (
        <>
          {/* Fallback: colored shape */}
          <Rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            fill={color}
            opacity={0.7}
            cornerRadius={6}
            stroke={isSelected ? "#8fa64a" : color}
            strokeWidth={isSelected ? 2.5 : 1}
            shadowColor={isSelected ? "#8fa64a" : "#000"}
            shadowBlur={isSelected ? 10 : 4}
            shadowOpacity={isSelected ? 0.35 : 0.12}
          />
          <Text
            x={-width / 2 + 4}
            y={-height / 2 + 4}
            width={width - 8}
            height={height - 8}
            text={product.name}
            fontSize={Math.min(11, width / 5)}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            ellipsis={true}
            wrap="word"
          />
        </>
      )}
    </Group>
  );
}
