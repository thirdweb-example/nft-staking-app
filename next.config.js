/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  basePath: '/_MYAPP',
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  publicRuntimeConfig: {
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    INFURA_SECRET_KEY: process.env.INFURA_SECRET_KEY,
  },
}

module.exports = nextConfig
