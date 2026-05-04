import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default.
  // Turbopack handles Node built-in polyfills automatically,
  // so no webpack fallbacks needed. Set empty turbopack config to silence warning.
  turbopack: {},
}

export default nextConfig
