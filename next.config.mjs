/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/map-coordinates-app' : '',
  images: {
    unoptimized: true, // Required for static export
  },
  // GitHub Pages doesn't support server-side functionality, so we're disabling them
  distDir: 'build',
};

export default nextConfig; 