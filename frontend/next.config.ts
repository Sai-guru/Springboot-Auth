import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '..' + '/frontend',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.accounts.az1.hashicorp.cloud',
      },
    ],
  },
};

export default nextConfig;
