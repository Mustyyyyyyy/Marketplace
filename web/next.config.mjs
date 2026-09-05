/** @type {import('next').NextConfig} */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.VERCEL ? 'https://api.YOUR-BACKEND-HOST.com' : 'http://localhost:4000');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/backend/:path*', destination: `${BACKEND_URL}/:path*` },
    ];
  },
  async headers() {
    return [
      { source: '/(.*)', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ] },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};
export default nextConfig;
