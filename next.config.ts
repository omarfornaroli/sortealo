import type { NextConfig } from 'next';

// Se permite definir el prefijo tanto mediante la variable pública (para el cliente)
// como mediante una variable interna (BASE_PATH) que solo el servidor necesita.
// Prioridad: BASE_PATH > BASE_PATH > ''
const base = process.env.BASE_PATH || '';

const nextConfig: NextConfig = {
  basePath: base,
  assetPrefix: base,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;