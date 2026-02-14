import { create } from "zustand";
import { v4 as uuid } from "uuid";

export interface CanvasItem {
  id: string;
  productId: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  height?: number; // Height in cm for wall-mounted items (lighting, etc.)
}

export interface ProductData {
  id: string;
  name: string;
  categoryId: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  topViewImageUrl: string | null;
  widthCm: number;
  heightCm: number;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
}

interface HistoryEntry {
  items: CanvasItem[];
}

export type ViewMode = "topView" | "perspective";

interface DesignerState {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Canvas dimensions
  balconyWidthCm: number;
  balconyHeightCm: number;
  setBalconySize: (w: number, h: number) => void;

  // Door position (which wall: 'left', 'right', 'back', 'front')
  doorWall: 'left' | 'right' | 'back' | 'front';
  setDoorWall: (wall: 'left' | 'right' | 'back' | 'front') => void;

  // Items on the canvas
  items: CanvasItem[];
  setItems: (items: CanvasItem[]) => void;

  // Selected product from catalog (to place)
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // Selected item on canvas
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;

  // Products and categories data
  products: ProductData[];
  categories: CategoryData[];
  setProducts: (products: ProductData[]) => void;
  setCategories: (categories: CategoryData[]) => void;

  // Place an item on canvas (x,y optional for auto-placement)
  placeItem: (productId: string, x?: number, y?: number) => void;

  // Quick-add: click to instantly place at a default position
  quickAddProduct: (productId: string) => void;

  // Update item position/rotation
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;

  // Delete an item
  deleteItem: (id: string) => void;

  // Rotate selected item
  rotateSelected: (degrees: number) => void;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Design metadata
  designId: string | null;
  designName: string;
  setDesignId: (id: string | null) => void;
  setDesignName: (name: string) => void;

  // Zoom
  zoom: number;
  setZoom: (zoom: number) => void;
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  viewMode: "perspective" as ViewMode,
  setViewMode: (mode) => set({ viewMode: mode }),

  balconyWidthCm: 300,
  balconyHeightCm: 200,
  setBalconySize: (w, h) => set({ balconyWidthCm: w, balconyHeightCm: h }),

  doorWall: 'back',
  setDoorWall: (wall) => set({ doorWall: wall }),

  items: [],
  setItems: (items) => set({ items }),

  selectedProductId: null,
  setSelectedProductId: (id) => set({ selectedProductId: id }),

  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),

  products: [],
  categories: [],
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),

  placeItem: (productId, x?, y?) => {
    const state = get();
    const product = state.products.find((p) => p.id === productId);
    const SCALE = 2;
    // Default placement: center of the balcony with slight random offset
    const defaultX = x ?? (state.balconyWidthCm * SCALE / 2 + (Math.random() - 0.5) * 60);
    const defaultY = y ?? (state.balconyHeightCm * SCALE / 2 + (Math.random() - 0.5) * 60);
    const newItem: CanvasItem = {
      id: uuid(),
      productId,
      x: defaultX,
      y: defaultY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    state.pushHistory();
    set({
      items: [...state.items, newItem],
      selectedProductId: null,
      selectedItemId: newItem.id,
    });
  },

  quickAddProduct: (productId) => {
    get().placeItem(productId);
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },

  deleteItem: (id) => {
    const state = get();
    state.pushHistory();
    set({
      items: state.items.filter((item) => item.id !== id),
      selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    });
  },

  rotateSelected: (degrees) => {
    const state = get();
    if (!state.selectedItemId) return;
    state.pushHistory();
    set({
      items: state.items.map((item) =>
        item.id === state.selectedItemId
          ? { ...item, rotation: (item.rotation + degrees) % 360 }
          : item
      ),
    });
  },

  history: [],
  historyIndex: -1,
  pushHistory: () => {
    const state = get();
    // Remove any history after current index (when undoing then making a new change)
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    // Add current state to history
    newHistory.push({ items: JSON.parse(JSON.stringify(state.items)) });
    // Keep only last 50 states
    const trimmedHistory = newHistory.slice(-50);
    set({
      history: trimmedHistory,
      historyIndex: trimmedHistory.length - 1,
    });
  },
  undo: () => {
    const state = get();
    // Can't undo if we're at the beginning or have no history
    if (state.historyIndex <= 0) return;
    // Go back one step in history
    const prevIndex = state.historyIndex - 1;
    const entry = state.history[prevIndex];
    set({
      items: JSON.parse(JSON.stringify(entry.items)),
      historyIndex: prevIndex,
      selectedItemId: null,
    });
  },
  redo: () => {
    const state = get();
    // Can't redo if we're at the end of history
    if (state.historyIndex >= state.history.length - 1) return;
    // Go forward one step in history
    const nextIndex = state.historyIndex + 1;
    const entry = state.history[nextIndex];
    set({
      items: JSON.parse(JSON.stringify(entry.items)),
      historyIndex: nextIndex,
      selectedItemId: null,
    });
  },

  designId: null,
  designName: "My Balcony Design",
  setDesignId: (id) => set({ designId: id }),
  setDesignName: (name) => set({ designName: name }),

  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(0.3, Math.min(3, zoom)) }),
}));
