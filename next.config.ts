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
  // Dev sets NEXT_DIST_DIR to avoid Desktop sync wiping `.next/`. Production keeps the default `.next` for Vercel.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
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
