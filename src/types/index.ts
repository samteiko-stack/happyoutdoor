export interface CanvasItem {
  id: string;
  productId: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface DesignData {
  items: CanvasItem[];
}

export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}
