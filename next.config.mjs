/** @type {import('next').NextConfig} */
const nextConfig = {
  // تحسينات للأداء والنشر على Vercel
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  // دعم الصور من مصادر خارجية
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pixeldrain.com',
        port: '',
        pathname: '/api/file/**',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: true,
  },
  // تحسينات للغة العربية
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
  // تحسينات الأمان
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
