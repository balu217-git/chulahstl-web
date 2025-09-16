import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   output: "export",
    images: {
    unoptimized: true, // 👈 disable built-in optimizer
  },
};

export default nextConfig;
