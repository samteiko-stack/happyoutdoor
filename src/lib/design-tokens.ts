/**
 * Design system token reference.
 * Source of truth for values is src/app/globals.css — use Tailwind classes in components.
 */
export const brandColors = {
  mossGreen: "#555F3D",
  mossDark: "#454E33",
  mediumGrey: "#D8D9D9",
  sage: "#8A9470",
  sageLight: "#C5CBBA",
  mossMuted: "#EEF0EA",
  white: "#FFFFFF",
  black: "#000000",
  charcoal: "#333333",
} as const;

export const tokens = {
  colors: {
    primary: "var(--primary)",
    accent: "var(--accent)",
    secondary: "var(--secondary)",
    background: "var(--background)",
    foreground: "var(--foreground)",
    muted: "var(--muted)",
    mutedForeground: "var(--muted-foreground)",
    destructive: "var(--destructive)",
    highlight: "var(--highlight)",
    surface: "var(--surface)",
    surfaceMuted: "var(--surface-muted)",
    surfaceSubtle: "var(--surface-subtle)",
    brandMoss: "var(--color-moss-green)",
    brandGrey: "var(--color-medium-grey)",
    brandSage: "var(--color-sage)",
  },
  spacing: {
    pageX: "var(--spacing-page-x)",
    pageY: "var(--spacing-page-y)",
    section: "var(--spacing-section)",
    navY: "var(--spacing-nav-y)",
    sidebarWidth: "var(--spacing-sidebar-width)",
    headerHeight: "var(--spacing-header-height)",
    contentX: "var(--spacing-content-x)",
    contentY: "var(--spacing-content-y)",
    cardPadding: "var(--spacing-card-padding)",
    chartHeight: "var(--spacing-chart-height)",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    "2xl": "var(--radius-2xl)",
    "3xl": "var(--radius-3xl)",
    "4xl": "var(--radius-4xl)",
    pill: "var(--radius-pill)",
    landing: "var(--landing-radius)",
  },
  typography: {
    sans: "var(--font-plus-jakarta)",
    display: "var(--font-plus-jakarta)",
  },
  assets: {
    logoDark: "/logo-dark.png",
    logoLight: "/logo-light.png",
    brandMark: "/brand-mark.png",
  },
  motion: {
    fast: "var(--motion-fast)",
    base: "var(--motion-base)",
    slow: "var(--motion-slow)",
    enter: "var(--motion-enter)",
    easeOut: "var(--ease-out)",
    easeIn: "var(--ease-in)",
  },
} as const;

/** For Konva — CSS var strings resolved by the browser at paint time */
export const designerColors = {
  selection: "var(--color-sage)",
  selectionDark: "var(--color-moss-green)",
  selectionGlow: "var(--color-sage-light)",
  gridLine: "var(--color-medium-grey)",
  placeholder: "var(--color-sage-light)",
  labelMuted: "var(--color-sage)",
  labelDark: "var(--color-moss-green)",
  canvasBg: "var(--designer-canvas-bg)",
  canvasFloor: "var(--designer-canvas-floor)",
  canvasLabel: "var(--color-charcoal)",
  itemFill: "var(--designer-item-fill)",
  itemStroke: "var(--designer-item-stroke)",
  itemLabelBg: "var(--designer-item-label-bg)",
  black: "var(--color-black)",
  white: "var(--color-white)",
} as const;

export const designerCategoryColors: Record<string, string> = {
  seating: "#7a6b5a",
  lighting: "#d4a843",
  plants: brandColors.mossGreen,
  planters: "#a67c52",
  decor: "#b8856c",
  tables: brandColors.mossDark,
};
