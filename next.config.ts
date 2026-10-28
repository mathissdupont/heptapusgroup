import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.heptapusgroup.com' },
      { protocol: 'https', hostname: 'heptapusgroup.com' },
    ],
  },
  async headers() {
    return [
      ...['/admin/:path*', '/api/:path*', '/login', '/register'].map(source => ({
        source, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
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
