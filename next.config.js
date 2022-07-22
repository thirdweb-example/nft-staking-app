/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  basePath: '/NFTFARMBUILDURL',
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
