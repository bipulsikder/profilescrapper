/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude backend directory from Next.js build
  experimental: {
    // This ensures backend files are not processed by Next.js
    outputFileTracingExcludes: {
      '**/*': ['backend/**/*']
    }
  }
}

module.exports = nextConfig