import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return []
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Set custom port
  async headers() {
    return []
  },
  // Custom port can be set via package.json scripts or --port flag
};

export default nextConfig;
