import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Convex file storage (today's uploads).
      { protocol: "https", hostname: "*.convex.cloud" },
      // Cloudflare R2 public bucket (future migration).
      { protocol: "https", hostname: "*.r2.dev" },
      // Seeded placeholder images.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
