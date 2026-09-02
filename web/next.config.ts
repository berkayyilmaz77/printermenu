import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Ürün görselleri admin panelinden @vercel/blob ile yükleniyor.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Test/örnek verideki placeholder görseller (scripts/seed-test-items.mjs).
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
