import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Strict Mode is disabled intentionally for the existing WebGL/GSAP lifecycle.
  reactStrictMode: false,
};

export default nextConfig;
