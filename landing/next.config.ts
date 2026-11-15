import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully static and ships inside the app's Vercel project:
  // `next build` writes landing/out, which scripts/build.mjs copies to dist/.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
