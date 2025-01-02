/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['@repo/ui', '@repo/fortune-utils'],
}

module.exports = nextConfig
