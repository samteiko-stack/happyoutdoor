"use client";

import { useRef, useState, useEffect } from "react";
import { useDesignerStore } from "@/lib/designer-store";

const SCALE = 2;

export function PerspectiveView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const {
    balconyWidthCm,
    balconyHeightCm,
    items,
    products,
    selectedItemId,
    setSelectedItemId,
  } = useDesignerStore();

  const canvasW = balconyWidthCm * SCALE;
  const canvasH = balconyHeightCm * SCALE;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scale the room to fit
  const maxW = containerSize.width * 0.7;
  const maxH = containerSize.height * 0.45;
  const fitScale = Math.min(maxW / canvasW, maxH / canvasH, 1.0);

  const floorW = canvasW * fitScale;
  const floorD = canvasH * fitScale; // depth of the floor
  const wallH = Math.min(floorD * 0.85, 220); // wall height

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #c5d4a8 0%, #d6dfc0 30%, #e2e6d2 60%, #edeae1 100%)",
      }}
    >
      {/* 3D Scene container */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -45%)",
          perspective: "900px",
          perspectiveOrigin: "50% 40%",
          width: floorW + 200,
          height: floorD + wallH + 100,
        }}
      >
        {/* === ROOM GROUP === */}
        <div
          className="absolute"
          style={{
            left: "50%",
            bottom: 30,
            transform: "translateX(-50%)",
            transformStyle: "preserve-3d",
            width: floorW,
            height: floorD,
          }}
        >
          {/* ---- FLOOR ---- */}
          <div
            className="absolute"
            style={{
              width: floorW,
              height: floorD,
              left: 0,
              bottom: 0,
              transform: "rotateX(65deg)",
              transformOrigin: "center bottom",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Floor surface */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #c8b89c 0%, #bfaf93 40%, #b5a588 100%)",
                borderRadius: "3px",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.06)",
              }}
            >
              {/* Wood plank pattern */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, 
                      transparent, transparent ${28 * fitScale}px, 
                      rgba(0,0,0,0.06) ${28 * fitScale}px, 
                      rgba(0,0,0,0.06) ${29 * fitScale}px
                    )
                  `,
                }}
              />
              {/* Subtle horizontal grain */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, #000 3px, #000 4px)",
                }}
              />
            </div>

            {/* ---- PRODUCTS ON FLOOR ---- */}
            {items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;

              const itemW = product.widthCm * SCALE * fitScale;
              const itemH = product.heightCm * SCALE * fitScale;
              const posX = item.x * fitScale;
              const posY = item.y * fitScale;
              const isSelected = selectedItemId === item.id;
              const imgUrl = product.imageUrl || product.topViewImageUrl;

              // "Stand up" the product from the tilted floor
              const productVisualH = Math.max(itemW, itemH) * 1.1;

              return (
                <div
                  key={item.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: posX - itemW / 2,
                    top: posY - itemH / 2,
                    width: itemW,
                    height: itemH,
                    transformStyle: "preserve-3d",
                    zIndex: Math.round(posY) + 10,
                  }}
                  onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                >
                  {/* Product standing upright from the floor */}
                  <div
                    style={{
                      position: "absolute",
                      width: itemW,
                      height: productVisualH,
                      bottom: 0,
                      left: 0,
                      transform: "rotateX(-65deg)",
                      transformOrigin: "center bottom",
                    }}
                  >
                    {/* Shadow */}
                    <div
                      className="absolute -bottom-1 left-[10%] right-[10%] h-2"
                      style={{
                        background: "radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)",
                        filter: "blur(2px)",
                      }}
                    />
                    {/* Product image */}
                    <div
                      className={`w-full h-full rounded overflow-hidden transition-all ${
                        isSelected
                          ? "ring-2 ring-[#8fa64a] shadow-lg shadow-[#8fa64a]/30"
                          : "shadow-md group-hover:shadow-lg group-hover:shadow-black/15"
                      }`}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#ddd8cc]">
                          <span className="text-[10px] text-[#7a7468] text-center px-1 font-medium">
                            {product.name}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Label */}
                    <div
                      className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[9px] font-medium transition-opacity ${
                        isSelected
                          ? "bg-[#6b7f3b] text-white opacity-100"
                          : "bg-white/95 text-[#3d3529] opacity-0 group-hover:opacity-100"
                      }`}
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
                    >
                      {product.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---- BACK WALL ---- */}
          <div
            className="absolute"
            style={{
              width: floorW,
              height: wallH,
              left: 0,
              bottom: floorD * 0.42,
              transformOrigin: "center bottom",
              zIndex: 0,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(180deg, #e8e2d4 0%, #ded8ca 70%, #d4ccbc 100%)",
                borderRadius: "4px 4px 0 0",
                boxShadow: "inset 0 0 30px rgba(0,0,0,0.04), inset 0 -4px 12px rgba(0,0,0,0.03)",
              }}
            >
              {/* Subtle wall texture */}
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, #000 8px, #000 9px)",
              }} />
              {/* Wall baseboard */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: 6,
                  background: "linear-gradient(180deg, #b8b0a0, #a8a090)",
                }}
              />
            </div>
          </div>

          {/* ---- LEFT WALL ---- */}
          <div
            className="absolute"
            style={{
              width: floorD * 0.45,
              height: wallH,
              left: -floorD * 0.24,
              bottom: floorD * 0.42 - floorD * 0.08,
              transform: "skewY(28deg)",
              transformOrigin: "right bottom",
              zIndex: 0,
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(180deg, #ddd6c6 0%, #d2ccbc 70%, #c8c0ae 100%)",
                borderRadius: "4px 0 0 0",
                boxShadow: "inset 2px 0 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* Window on left wall */}
              <div
                className="absolute"
                style={{
                  width: "55%",
                  height: "45%",
                  left: "22%",
                  top: "15%",
                  background: "linear-gradient(180deg, #b8cce0 0%, #c8d8e8 100%)",
                  borderRadius: 3,
                  border: "3px solid #c0b8a8",
                  boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* Window cross */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#c0b8a8]" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#c0b8a8]" />
              </div>
              {/* Baseboard */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 6, background: "linear-gradient(180deg, #a8a090, #989080)" }}
              />
            </div>
          </div>

          {/* ---- FRONT RAILING ---- */}
          <div
            className="absolute"
            style={{
              width: floorW + 8,
              left: -4,
              bottom: -8,
              zIndex: 50,
            }}
          >
            {/* Railing top bar */}
            <div
              style={{
                width: "100%",
                height: 5,
                background: "linear-gradient(180deg, #888078, #787068)",
                borderRadius: 3,
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            />
            {/* Glass panels */}
            <div className="relative" style={{ height: 32 }}>
              {Array.from({ length: Math.max(2, Math.floor(floorW / 80)) }).map((_, i, arr) => {
                const panelW = (floorW + 8) / arr.length - 6;
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      width: panelW,
                      height: 28,
                      left: i * ((floorW + 8) / arr.length) + 3,
                      top: 2,
                      background: "linear-gradient(180deg, rgba(180,210,220,0.35), rgba(160,195,210,0.2))",
                      border: "1px solid rgba(120,150,160,0.25)",
                      borderRadius: 2,
                      backdropFilter: "blur(1px)",
                    }}
                  />
                );
              })}
            </div>
            {/* Bottom bar */}
            <div
              style={{
                width: "100%",
                height: 4,
                background: "linear-gradient(180deg, #787068, #686058)",
                borderRadius: 2,
              }}
            />
            {/* Railing posts */}
            {Array.from({ length: Math.max(3, Math.floor(floorW / 80) + 1) }).map((_, i, arr) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: 5,
                  height: 40,
                  left: i * (floorW / (arr.length - 1)),
                  top: -2,
                  background: "linear-gradient(90deg, #787068, #888078, #787068)",
                  borderRadius: 2,
                  boxShadow: "1px 0 2px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>

          {/* ---- RIGHT RAILING ---- */}
          <div
            className="absolute"
            style={{
              right: -8,
              bottom: -8,
              height: floorD * 0.42 + 16,
              width: 8,
              zIndex: 40,
            }}
          >
            {/* Vertical bar */}
            <div
              className="absolute right-0"
              style={{
                width: 5,
                height: "100%",
                background: "linear-gradient(90deg, #787068, #888078)",
                borderRadius: 2,
                transform: "skewY(-28deg)",
                transformOrigin: "right bottom",
              }}
            />
          </div>
        </div>
      </div>

      {/* Sky / ambient light glow */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "40%",
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 70%)",
        }}
      />

      {/* Info overlays */}
      <div className="absolute bottom-3 left-3 bg-white/90 rounded-md px-3 py-1.5 text-xs text-[#7a7468] shadow-sm backdrop-blur-sm">
        {balconyWidthCm} x {balconyHeightCm} cm · {items.length} item{items.length !== 1 ? "s" : ""}
      </div>
      <div className="absolute top-3 left-3 bg-white/90 rounded-md px-3 py-1.5 text-xs font-medium text-[#3d3529] shadow-sm backdrop-blur-sm">
        3D Balcony Preview
      </div>
    </div>
  );
}
