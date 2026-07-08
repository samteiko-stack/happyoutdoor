/**
 * Design system token reference.
 * Source of truth for values is src/app/globals.css — use Tailwind classes in components.
 */
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
  },
  spacing: {
    pageX: "var(--spacing-page-x)",
    pageY: "var(--spacing-page-y)",
    section: "var(--spacing-section)",
    navY: "var(--spacing-nav-y)",
  },
  radius: {
    default: "var(--radius)",
  },
} as const;

/** For Three.js / canvas contexts that need raw color strings */
export const designerColors = {
  selection: "#A7B500",
  gridLine: "#C0B8A8",
  placeholder: "#DDD8CC",
  labelMuted: "#7A7468",
  labelDark: "#3D3529",
} as const;
