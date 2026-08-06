import type { NextConfig } from "next";

/**
 * Static export: every page is prerendered to HTML at build time into `out/`,
 * which Cloudflare serves as static assets. There is no server at runtime —
 * that is the point (no backend, no DB, no AI in the request path).
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
