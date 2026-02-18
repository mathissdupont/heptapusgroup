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
  async rewrites() {
    return {
      // beforeFiles: filesystem kontrolünden ÖNCE çalışır
      // Bu sayede public/uploads/ ile çakışma olmaz
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: '/api/serve-uploads/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};
export default nextConfig;
