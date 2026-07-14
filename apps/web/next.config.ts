import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@calcoster/calculator-engine", "@calcoster/types"],
};

export default nextConfig;
