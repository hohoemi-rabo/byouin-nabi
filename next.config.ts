import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// PWA は本番ビルドのみ有効（Turbopack との互換性警告を回避）
const isDev = process.env.NODE_ENV === "development";

let config = nextConfig;

if (!isDev) {
  const withPWAInit = require("@ducanh2912/next-pwa").default;
  const withPWA = withPWAInit({
    dest: "public",
    fallbacks: {
      document: "/~offline",
    },
  });
  config = withPWA(nextConfig);
}

export default config;
