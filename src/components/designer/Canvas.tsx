"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Text, Group, Line, Transformer } from "react-konva";
import Konva from "konva";
import { useDesignerStore } from "@/lib/designer-store";
import { CanvasItemComponent } from "./CanvasItem";

const SCALE = 2; // 1 cm = 2 pixels
const PADDING = 40;
const GRID_SIZE = 20; // 20cm grid

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const {
    balconyWidthCm,
    balconyHeightCm,
    items,
    selectedProductId,
    selectedItemId,
    setSelectedItemId,
    placeItem,
    updateItem,
    products,
    zoom,
    deleteItem,
  } = useDesignerStore();

  const canvasWidth = balconyWidthCm * SCALE;
  const canvasHeight = balconyHeightCm * SCALE;

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-fit zoom
  useEffect(() => {
    const scaleX = (containerSize.width - PADDING * 2) / canvasWidth;
    const scaleY = (containerSize.height - PADDING * 2) / canvasHeight;
    const autoZoom = Math.min(scaleX, scaleY, 1.5);
    useDesignerStore.getState().setZoom(autoZoom);
  }, [containerSize, canvasWidth, canvasHeight]);

  // Update transformer when selection changes
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    if (selectedItemId) {
      const node = stage.findOne(`#${selectedItemId}`);
      if (node) {
        transformer.nodes([node]);
        transformer.getLayer()?.batchDraw();
        return;
      }
    }
    transformer.nodes([]);
    transformer.getLayer()?.batchDraw();
  }, [selectedItemId, items]);

  // Grid lines
  const gridLines = [];
  for (let x = 0; x <= balconyWidthCm; x += GRID_SIZE) {
    gridLines.push(
      <Line
        key={`v-${x}`}
        points={[x * SCALE, 0, x * SCALE, canvasHeight]}
        stroke="#e5e7eb"
        strokeWidth={0.5}
      />
    );
  }
  for (let y = 0; y <= balconyHeightCm; y += GRID_SIZE) {
    gridLines.push(
      <Line
        key={`h-${y}`}
        points={[0, y * SCALE, canvasWidth, y * SCALE]}
        stroke="#e5e7eb"
        strokeWidth={0.5}
      />
    );
  }

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      // If we clicked on the stage background (not an item)
      const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === "balcony-bg" || e.target.name() === "grid-line";

      if (clickedOnEmpty) {
        if (selectedProductId) {
          // Place the selected product
          const pointerPos = stage.getPointerPosition();
          if (!pointerPos) return;

          // Account for stage offset and zoom
          const stageX = (containerSize.width - canvasWidth * zoom) / 2;
          const stageY = (containerSize.height - canvasHeight * zoom) / 2;
          const x = (pointerPos.x - stageX) / zoom / SCALE;
          const y = (pointerPos.y - stageY) / zoom / SCALE;

          // Check bounds
          if (x >= 0 && x <= balconyWidthCm && y >= 0 && y <= balconyHeightCm) {
            placeItem(selectedProductId, x * SCALE, y * SCALE);
          }
        } else {
          setSelectedItemId(null);
        }
      }
    },
    [selectedProductId, placeItem, setSelectedItemId, containerSize, canvasWidth, canvasHeight, zoom, balconyWidthCm, balconyHeightCm]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedItemId && !(e.target instanceof HTMLInputElement)) {
          deleteItem(selectedItemId);
        }
      }
      if (e.key === "Escape") {
        setSelectedItemId(null);
        useDesignerStore.getState().setSelectedProductId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItemId, deleteItem, setSelectedItemId]);

  const offsetX = (containerSize.width - canvasWidth * zoom) / 2;
  const offsetY = (containerSize.height - canvasHeight * zoom) / 2;

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-gray-100 relative ${selectedProductId ? "cursor-crosshair" : "cursor-default"}`}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onClick={handleStageClick}
      >
        <Layer x={offsetX} y={offsetY} scaleX={zoom} scaleY={zoom}>
          {/* Balcony background */}
          <Rect
            name="balcony-bg"
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="white"
            stroke="#8fa64a"
            strokeWidth={2}
            cornerRadius={4}
            shadowColor="#000"
            shadowBlur={10}
            shadowOpacity={0.1}
            shadowOffsetX={2}
            shadowOffsetY={2}
          />

          {/* Grid */}
          {gridLines}

          {/* Dimension labels */}
          <Text
            text={`${balconyWidthCm} cm`}
            x={canvasWidth / 2 - 30}
            y={canvasHeight + 10}
            fontSize={12}
            fill="#6b7280"
          />
          <Text
            text={`${balconyHeightCm} cm`}
            x={canvasWidth + 10}
            y={canvasHeight / 2 - 6}
            fontSize={12}
            fill="#6b7280"
            rotation={0}
          />

          {/* Items */}
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <CanvasItemComponent
                key={item.id}
                item={item}
                product={product}
                isSelected={selectedItemId === item.id}
                scale={SCALE}
                onSelect={() => setSelectedItemId(item.id)}
                onDragEnd={(x, y) => {
                  useDesignerStore.getState().pushHistory();
                  updateItem(item.id, { x, y });
                }}
              />
            );
          })}

          {/* Transformer for selected item */}
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={[]}
            borderStroke="#8fa64a"
            borderStrokeWidth={2}
            rotateAnchorOffset={20}
            anchorStroke="#8fa64a"
            anchorFill="#fff"
            anchorSize={10}
          />
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 left-3 bg-white/90 rounded-md px-2 py-1 text-xs text-gray-500 shadow-sm">
        {Math.round(zoom * 100)}%
      </div>

      {selectedProductId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded text-sm shadow-lg">
          Click on the balcony to place the product
        </div>
      )}
    </div>
  );
}
