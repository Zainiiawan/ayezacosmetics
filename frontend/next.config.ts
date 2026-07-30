import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@ayeza/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
