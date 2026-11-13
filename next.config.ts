import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // PGlite (local Postgres in WebAssembly) loads its .wasm/.data files from disk at runtime.
  serverExternalPackages: ["@electric-sql/pglite"],
  partialPrefetching: true,
  experimental: {
    // The root layout lives in app/[lang], so unmatched URLs need a global 404 page.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
