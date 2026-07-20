import { useEffect, useState } from "react";
import { readCssColor } from "@/lib/css-color";

/** CSS custom properties for designer canvas — source of truth is globals.css */
export const designerCanvasVars = {
  canvasBg: "--designer-canvas-bg",
  canvasFloor: "--designer-canvas-floor",
  stageBgEnd: "--designer-stage-bg-end",
  sceneBgDay: "--designer-scene-bg-day",
  sceneBgNight: "--designer-scene-bg-night",
  sceneLightDay: "--designer-scene-light-day",
  sceneLightNight: "--designer-scene-light-night",
  sceneFillDay: "--designer-scene-fill-day",
  sceneFillNight: "--designer-scene-fill-night",
  sceneGroundDay: "--designer-scene-ground-day",
  sceneGroundNight: "--designer-scene-ground-night",
  selection: "--color-sage",
  selectionGlow: "--color-sage-light",
  gridLine: "--color-medium-grey",
  itemFill: "--designer-item-fill",
  itemStroke: "--designer-item-stroke",
  itemLabelBg: "--designer-item-label-bg",
  labelMuted: "--color-sage",
  white: "--color-white",
} as const;

/** SSR / pre-hydration fallbacks — must mirror :root in globals.css */
export const designerCanvasFallbacks: Record<
  keyof typeof designerCanvasVars,
  string
> = {
  canvasBg: "#F0EFEB",
  canvasFloor: "#FFFFFF",
  stageBgEnd: "#F0EFEB",
  sceneBgDay: "#F0EFEB",
  sceneBgNight: "#141415",
  sceneLightDay: "#FFFFFF",
  sceneLightNight: "#dcd4c8",
  sceneFillDay: "#EBEBEB",
  sceneFillNight: "#5a5550",
  sceneGroundDay: "#F0EFEB",
  sceneGroundNight: "#121110",
  selection: "#8A9470",
  selectionGlow: "#C5CBBA",
  gridLine: "#D8D9D9",
  itemFill: "#EBEBEB",
  itemStroke: "rgba(0, 0, 0, 0.15)",
  itemLabelBg: "rgba(45, 36, 24, 0.7)",
  labelMuted: "#8A9470",
  white: "#FFFFFF",
};

export const designerBalconyPalette = {
  day: {
    floorBase: "#8a7a6a",
    floor: "#e8d4b8",
    trim: "#b89870",
    wall: "#e8b89a",
    wallBack: "#c8a878",
    doorFrame: "#b8a890",
    doorEdge: "#6a5a4a",
    doorHandle: "#d4d4d4",
    glass: "#f5f0eb",
    glassOpacity: 0.3,
    wallOpacity: 0.95,
  },
  night: {
    floorBase: "#504840",
    floor: "#968878",
    trim: "#786848",
    wall: "#967868",
    wallBack: "#867050",
    doorFrame: "#787068",
    doorEdge: "#504030",
    doorHandle: "#909090",
    glass: "#5a5550",
    glassOpacity: 0.26,
    wallOpacity: 0.95,
  },
} as const;

export function getDesignerBalconyPalette(isNight: boolean) {
  return isNight ? designerBalconyPalette.night : designerBalconyPalette.day;
}

export function readDesignerCanvasColor(
  key: keyof typeof designerCanvasVars
): string {
  return readCssColor(
    designerCanvasVars[key],
    designerCanvasFallbacks[key]
  );
}

export function getDesignerSceneColors(isNight: boolean) {
  return {
    background: readDesignerCanvasColor(isNight ? "sceneBgNight" : "sceneBgDay"),
    light: readDesignerCanvasColor(isNight ? "sceneLightNight" : "sceneLightDay"),
    fill: readDesignerCanvasColor(isNight ? "sceneFillNight" : "sceneFillDay"),
    ground: readDesignerCanvasColor(isNight ? "sceneGroundNight" : "sceneGroundDay"),
  };
}

export function useDesignerSceneColors(isNight: boolean) {
  const [colors, setColors] = useState(() => getDesignerSceneColors(isNight));

  useEffect(() => {
    setColors(getDesignerSceneColors(isNight));
    const frame = requestAnimationFrame(() => {
      setColors(getDesignerSceneColors(isNight));
    });
    return () => cancelAnimationFrame(frame);
  }, [isNight]);

  return colors;
}

export function useResolvedDesignerColor(key: keyof typeof designerCanvasVars) {
  const [color, setColor] = useState(() => readDesignerCanvasColor(key));

  useEffect(() => {
    setColor(readDesignerCanvasColor(key));
  }, [key]);

  return color;
}
