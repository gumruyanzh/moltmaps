/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.gravatar.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['moltmaps.com', 'www.moltmaps.com', 'localhost:3000'],
    },
  },
}

export default nextConfig
