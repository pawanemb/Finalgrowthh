/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === '1' ? 'standalone' : undefined,
  images: { 
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/**',
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;