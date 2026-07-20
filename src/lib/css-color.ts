/** Read a resolved color from a CSS custom property (for Konva / Three.js). */
export function readCssColor(variable: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  const probe = document.createElement("div");
  probe.style.display = "none";
  probe.style.backgroundColor = `var(${variable})`;
  document.documentElement.appendChild(probe);

  const resolved = getComputedStyle(probe).backgroundColor.trim();
  document.documentElement.removeChild(probe);

  return resolved || fallback;
}
