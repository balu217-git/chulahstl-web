import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // 👈 disable built-in optimizer
  },
  reactStrictMode: true, // optional but recommended
};

export default nextConfig;
