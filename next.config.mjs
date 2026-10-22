/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@node-rs/argon2',
      'better-sqlite3',
      'pdf-parse',
      'tesseract.js',
    ],
  },
};

export default nextConfig;
