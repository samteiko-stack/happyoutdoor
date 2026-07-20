"use client";

import { useEffect, useRef } from "react";
import { useDesignerStore, type CanvasItem } from "@/lib/designer-store";
import {
  itemCameraFocus,
  overviewCameraFocus,
} from "@/lib/designer-camera";

type DemoStep =
  | { type: "wait"; ms: number }
  | { type: "cursorTo"; selector: string; ms?: number }
  | { type: "click" }
  | { type: "openCategory"; index: number }
  | { type: "addProduct"; categoryIndex: number; productIndex: number }
  | { type: "clickToolbar"; which: "day" | "night" | "rotate-cw" | "rotate-ccw" }
  | { type: "selectPlaced"; index: number }
  | { type: "nudge"; index: number; dx: number; dy: number; ms?: number }
  | { type: "reset" };

const LOOP: DemoStep[] = [
  { type: "wait", ms: 1600 },
  { type: "clickToolbar", which: "day" },
  { type: "wait", ms: 2200 },
  { type: "openCategory", index: 0 },
  { type: "wait", ms: 900 },
  { type: "addProduct", categoryIndex: 0, productIndex: 0 },
  { type: "wait", ms: 1800 },
  { type: "selectPlaced", index: 0 },
  { type: "wait", ms: 700 },
  { type: "clickToolbar", which: "rotate-cw" },
  { type: "wait", ms: 1400 },
  { type: "clickToolbar", which: "rotate-cw" },
  { type: "wait", ms: 1400 },
  { type: "nudge", index: 0, dx: 32, dy: -20, ms: 1600 },
  { type: "wait", ms: 1200 },
  { type: "openCategory", index: 1 },
  { type: "wait", ms: 900 },
  { type: "addProduct", categoryIndex: 1, productIndex: 0 },
  { type: "wait", ms: 2000 },
  { type: "clickToolbar", which: "night" },
  { type: "wait", ms: 2800 },
  { type: "clickToolbar", which: "day" },
  { type: "wait", ms: 2200 },
  { type: "openCategory", index: 2 },
  { type: "wait", ms: 900 },
  { type: "addProduct", categoryIndex: 2, productIndex: 0 },
  { type: "wait", ms: 1800 },
  { type: "selectPlaced", index: 1 },
  { type: "wait", ms: 700 },
  { type: "clickToolbar", which: "rotate-ccw" },
  { type: "wait", ms: 1600 },
  { type: "clickToolbar", which: "night" },
  { type: "wait", ms: 3000 },
  { type: "reset" },
  { type: "wait", ms: 2000 },
];

function cloneItems(items: CanvasItem[]): CanvasItem[] {
  return JSON.parse(JSON.stringify(items)) as CanvasItem[];
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function sleep(ms: number, signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(pollId);
      resolve();
    };
    const timeoutId = window.setTimeout(finish, ms);
    const pollId = window.setInterval(() => {
      if (signal.cancelled) finish();
    }, 100);
  });
}

function animateValue(
  durationMs: number,
  signal: { cancelled: boolean },
  onFrame: (progress: number) => void,
  ease: (t: number) => number = easeInOutCubic
) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      if (signal.cancelled) {
        resolve();
        return;
      }
      const t = Math.min(1, (now - start) / durationMs);
      onFrame(ease(t));
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

/** Scroll only inside a panel — never the document (avoids page jumping to hero). */
function scrollWithinPanel(el: HTMLElement, shell: HTMLElement) {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== shell) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      const elRect = el.getBoundingClientRect();
      const panelRect = node.getBoundingClientRect();
      const elTop = elRect.top - panelRect.top + node.scrollTop;
      const elBottom = elTop + elRect.height;
      const viewTop = node.scrollTop;
      const viewBottom = viewTop + node.clientHeight;
      const pad = 8;

      if (elTop < viewTop + pad) {
        node.scrollTop = Math.max(0, elTop - pad);
      } else if (elBottom > viewBottom - pad) {
        node.scrollTop = elBottom - node.clientHeight + pad;
      }
      return;
    }
    node = node.parentElement;
  }
}

/** Landing auto-demo only — shell is non-interactive; cursor drives everything. */
export function useLandingCanvasDemo(ready: boolean) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const baselineRef = useRef<CanvasItem[]>([]);
  const cursorPos = useRef({ x: 40, y: 40 });

  useEffect(() => {
    if (!ready) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const shell = shellRef.current;
    if (!shell) return;

    const cursorEl = shell.querySelector<HTMLElement>("[data-demo-cursor]");
    if (!cursorEl) return;
    const cursor = cursorEl;

    const store = useDesignerStore.getState();
    baselineRef.current = cloneItems(store.items);
    store.setViewMode("perspective");
    store.setCameraFocus(
      overviewCameraFocus(store.balconyWidthCm, store.balconyHeightCm)
    );

    const signal = { cancelled: false };
    let stepIndex = 0;

    function focusItem(
      item: CanvasItem,
      options: { close?: boolean; orbitDelta?: number } = {}
    ) {
      const s = useDesignerStore.getState();
      s.setCameraFocus(
        itemCameraFocus(item, s.balconyWidthCm, s.balconyHeightCm, {
          distanceFactor: options.close ? 1.28 : 1.55,
          orbitDelta: options.orbitDelta,
        })
      );
    }

    function focusOverview() {
      const s = useDesignerStore.getState();
      s.setCameraFocus(overviewCameraFocus(s.balconyWidthCm, s.balconyHeightCm));
    }

    const setCursor = (x: number, y: number, clicking = false) => {
      cursorPos.current = { x, y };
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${clicking ? 0.86 : 1})`;
      cursor.classList.toggle("is-clicking", clicking);
    };

    function query(selector: string) {
      return shell!.querySelector<HTMLElement>(selector);
    }

    function queryAll(selector: string) {
      return Array.from(shell!.querySelectorAll<HTMLElement>(selector));
    }

    async function moveCursorTo(el: HTMLElement, durationMs = 950) {
      const shellRect = shell!.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const toX = rect.left - shellRect.left + rect.width / 2;
      const toY = rect.top - shellRect.top + rect.height / 2;
      const from = { ...cursorPos.current };

      cursor.classList.add("is-visible");
      await animateValue(durationMs, signal, (p) => {
        setCursor(from.x + (toX - from.x) * p, from.y + (toY - from.y) * p);
      });
      setCursor(toX, toY);
    }

    async function clickElement(el: HTMLElement) {
      setCursor(cursorPos.current.x, cursorPos.current.y, true);
      await sleep(140, signal);
      if (typeof el.focus === "function") {
        try {
          el.focus({ preventScroll: true });
        } catch {
          // ignore — focus is optional for demo clicks
        }
      }
      el.click();
      await sleep(180, signal);
      setCursor(cursorPos.current.x, cursorPos.current.y, false);
      await sleep(220, signal);
    }

    const shellEl = shell;

    async function cursorClick(selector: string, moveMs = 950) {
      const el = query(selector);
      if (!el) return false;
      scrollWithinPanel(el, shellEl);
      await sleep(180, signal);
      await moveCursorTo(el, moveMs);
      await sleep(200, signal);
      await clickElement(el);
      return true;
    }

    async function runStep(step: DemoStep) {
      switch (step.type) {
        case "wait":
          await sleep(step.ms, signal);
          break;

        case "cursorTo": {
          const el = query(step.selector);
          if (!el) break;
          await moveCursorTo(el, step.ms ?? 950);
          break;
        }

        case "click": {
          const el = document.elementFromPoint(
            shell!.getBoundingClientRect().left + cursorPos.current.x,
            shell!.getBoundingClientRect().top + cursorPos.current.y
          ) as HTMLElement | null;
          if (el) await clickElement(el.closest("button, [data-demo]") ?? el);
          break;
        }

        case "openCategory": {
          const categories = queryAll('[data-demo="catalog-category"]');
          const trigger = categories[step.index] ?? categories[0];
          if (!trigger) break;
          const expanded = trigger.getAttribute("data-state") === "open";
          if (!expanded) {
            await cursorClick(
              `[data-demo="catalog-category"][data-demo-id="${trigger.dataset.demoId}"]`,
              1100
            );
            await sleep(450, signal);
          } else {
            await moveCursorTo(trigger, 900);
            await sleep(300, signal);
          }
          break;
        }

        case "addProduct": {
          const categories = queryAll('[data-demo="catalog-category"]');
          const trigger = categories[step.categoryIndex] ?? categories[0];
          if (!trigger) break;

          if (trigger.getAttribute("data-state") !== "open") {
            await cursorClick(
              `[data-demo="catalog-category"][data-demo-id="${trigger.dataset.demoId}"]`,
              1000
            );
            await sleep(500, signal);
          }

          const itemEl = trigger.closest("[data-slot='accordion-item']");
          const products = itemEl
            ? Array.from(itemEl.querySelectorAll<HTMLElement>('[data-demo="catalog-product"]'))
            : queryAll('[data-demo="catalog-product"]');
          const product = products[step.productIndex] ?? products[0];
          if (!product) break;

          scrollWithinPanel(product, shellEl);
          await sleep(180, signal);
          await moveCursorTo(product, 1000);
          await sleep(250, signal);
          const beforeCount = useDesignerStore.getState().items.length;
          await clickElement(product);
          await sleep(400, signal);
          const after = useDesignerStore.getState();
          const added = after.items[after.items.length - 1];
          if (added && after.items.length > beforeCount) {
            focusItem(added, { close: true });
            await sleep(1100, signal);
          }
          break;
        }

        case "clickToolbar": {
          const map = {
            day: '[data-demo="toolbar-day"]',
            night: '[data-demo="toolbar-night"]',
            "rotate-cw": '[data-demo="toolbar-rotate-cw"]',
            "rotate-ccw": '[data-demo="toolbar-rotate-ccw"]',
          } as const;

          if (step.which.startsWith("rotate")) {
            const s = useDesignerStore.getState();
            const selected = s.items.find((i) => i.id === s.selectedItemId);
            if (selected) {
              focusItem(selected, { close: true });
              await sleep(900, signal);
            }
          } else {
            focusOverview();
            await sleep(650, signal);
          }

          await cursorClick(map[step.which], 1000);

          if (step.which.startsWith("rotate")) {
            const s = useDesignerStore.getState();
            const selected = s.items.find((i) => i.id === s.selectedItemId);
            if (selected) {
              focusItem(selected, { close: true });
              await sleep(900, signal);
            }
          }
          break;
        }

        case "selectPlaced": {
          const placed = queryAll('[data-demo="catalog-placed"]');
          const el = placed[step.index] ?? placed[0];
          if (!el) break;
          scrollWithinPanel(el, shellEl);
          await sleep(180, signal);
          await moveCursorTo(el, 950);
          await sleep(200, signal);
          await clickElement(el);
          await sleep(200, signal);
          const s = useDesignerStore.getState();
          const item = s.items.find((i) => i.id === s.selectedItemId) ?? s.items[step.index];
          if (item) {
            focusItem(item, { close: true });
            await sleep(1100, signal);
          }
          break;
        }

        case "nudge": {
          const s = useDesignerStore.getState();
          const item = s.items[step.index];
          if (!item) break;
          s.setSelectedItemId(item.id);
          focusItem(item, { close: true });
          await sleep(700, signal);
          const fromX = item.x;
          const fromY = item.y;
          const toX = fromX + step.dx;
          const toY = fromY + step.dy;
          const ms = step.ms ?? 1600;
          await animateValue(ms, signal, (p) => {
            const state = useDesignerStore.getState();
            const next = {
              ...item,
              x: fromX + (toX - fromX) * p,
              y: fromY + (toY - fromY) * p,
            };
            state.updateItem(item.id, { x: next.x, y: next.y });
            focusItem(next, { close: true });
          });
          break;
        }

        case "reset": {
          const s = useDesignerStore.getState();
          s.setViewMode("perspective");
          s.setTimeOfDay("night");
          s.setSelectedItemId(null);
          s.setItems(cloneItems(baselineRef.current));
          focusOverview();
          // Collapse open categories for the next loop
          queryAll('[data-demo="catalog-category"][data-state="open"]').forEach((el) => {
            el.click();
          });
          cursor.classList.remove("is-visible");
          setCursor(40, 80, false);
          await sleep(400, signal);
          break;
        }
      }
    }

    // Start cursor near catalog
    setCursor(shell.clientWidth - 120, 140, false);
    cursor.classList.add("is-visible");

    async function loop() {
      while (!signal.cancelled) {
        const step = LOOP[stepIndex % LOOP.length];
        stepIndex += 1;
        await runStep(step);
      }
    }

    void loop();

    return () => {
      signal.cancelled = true;
      cursor.classList.remove("is-visible", "is-clicking", "is-paused");
      useDesignerStore.getState().setCameraFocus(null);
    };
  }, [ready]);

  return shellRef;
}
