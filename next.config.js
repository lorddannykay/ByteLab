/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Help prevent hydration issues
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Ignore TypeScript errors during build (for faster deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

