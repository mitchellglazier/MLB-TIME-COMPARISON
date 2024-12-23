import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'content.mlb.com',
        pathname: '/images/headshots/current/**',
      },
    ],
  },
};

export default nextConfig;
