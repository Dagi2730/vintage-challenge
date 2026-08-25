/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable reactStrictMode if needed, or add:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;