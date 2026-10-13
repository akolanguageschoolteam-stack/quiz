import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // "export" mode makes next dev hard-crash on any unbuilt dynamic param
  // (e.g. a random /slug) instead of rendering not-found.tsx. Only enable
  // it for the production static build; prod handles unmatched paths via
  // the prebuilt 404.html with no crash.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  reactCompiler: true,
};

export default nextConfig;
