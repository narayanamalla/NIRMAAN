import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fix workspace root detection issue
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
  // Ensure correct working directory
  dir: __dirname,
};

export default nextConfig;
