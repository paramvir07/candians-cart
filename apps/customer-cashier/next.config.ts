// apps/customer-cashier/next.config.ts
import type { NextConfig } from "next";

// This is the main root Next.js configuration file for the customer-cashier app. It is used to configure various aspects of the Next.js framework, such as rewrites, redirects, and other settings.

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/admin/:path*",
        destination: `${process.env.SERVER_1_URL}/admin/:path*`,
      },
      {
        source: "/store/:path*",
        destination: `${process.env.SERVER_1_URL}/store/:path*`,
      },
      {
        source: "/immigration/:path*",
        destination: `${process.env.SERVER_1_URL}/immigration/:path*`,
      },
      {
        source: "/imagekit/:path*",
        destination: `${process.env.SERVER_1_URL}/imagekit/:path*`,
      },
    ];
  },
  transpilePackages: [
    "@canadian-cart/ui",
    "@canadian-cart/db",
    "@canadian-cart/types",
    "@canadian-cart/actions",
    "@canadian-cart/lib",
  ], // Ensures that the shared UI, DB, and types packages are transpiled for compatibility with this Next.js app.
};

export default nextConfig;
