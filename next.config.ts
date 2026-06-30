import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
  // Allow mobile devices on the local network to access the dev server
  allowedDevOrigins: ["192.168.29.217"],
  experimental: {
    // Disable HMR cache so server fetches always go fresh to TMDB during dev
    serverComponentsHmrCache: false,
  },
};

export default nextConfig;
