import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // disable built-in optimizer (optional)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
    qualities: [75, 90], // 👈 explicitly allow quality 90
  },
};

export default nextConfig;
