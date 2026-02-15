import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.heptapusgroup.com' },
      { protocol: 'https', hostname: 'heptapusgroup.com' },
    ],
  },
};
export default nextConfig;
