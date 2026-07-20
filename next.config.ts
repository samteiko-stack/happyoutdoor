import type { NextConfig } from "next";

const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Keep build output under node_modules/.cache — `.next/` on Desktop gets wiped by sync/watchers.
  distDir:
    process.env.NEXT_DIST_DIR || "node_modules/.cache/next-build",
  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui", "iconoir-react"],
  },
  async redirects() {
    return [{ source: "/enter", destination: "/login", permanent: true }];
  },
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost }]
        : []),
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
