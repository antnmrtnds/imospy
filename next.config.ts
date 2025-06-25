import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow builds to succeed even if ESLint errors are present
  eslint: {
    ignoreDuringBuilds: true,
  },
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
