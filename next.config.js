/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/Finalgrowthh' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Finalgrowthh/' : '',
};

module.exports = nextConfig;