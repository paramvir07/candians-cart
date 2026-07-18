import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: Forces Next.js to compile your shared UI monorepo package
  transpilePackages: ["@canadian-cart/ui", "@canadian-cart/db", "@canadian-cart/types"], 
  
  // CRITICAL: Prevents chunk file collisions between your two servers in production
  assetPrefix: process.env.NODE_ENV === "production" ? "/_next/server1-chunks" : undefined,
};

export default nextConfig;