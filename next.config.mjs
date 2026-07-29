/** @type {import('next').NextConfig} */
/**
 * Monorepo-root Next config for Vercel when Root Directory is ".".
 * The real app lives in apps/web; buildCommand builds there then copies .next to root.
 * Prefer setting Vercel Root Directory to "apps/web" (then this file is unused).
 */
const nextConfig = {
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
