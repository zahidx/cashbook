import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Your other config options here

  // Add the PWA configuration
  pwa: {
    dest: "public",  // Directory where service worker and manifest will be generated
    register: true,  // Automatically registers the service worker
    skipWaiting: true,  // Forces the service worker to take control immediately after installation
  },
};

export default withPWA(nextConfig);
