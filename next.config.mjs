/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enforce linting during builds for production quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Do not ignore build errors; fail builds on type errors
    ignoreBuildErrors: false,
  },
  images: {
    // Use Next.js image optimization
    unoptimized: false,
  },
  // Disable Next.js dev tools completely
  devIndicators: false,
  experimental: {
    // Enable Next.js production optimizations
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'lodash-es',
      'ramda',
      'antd',
      'react-bootstrap',
      'ahooks',
      '@ant-design/icons',
      '@headlessui/react',
      '@headlessui-float/react',
      '@heroicons/react/20/solid',
      '@heroicons/react/24/solid',
      '@heroicons/react/24/outline',
      '@visx/visx',
      '@tremor/react',
      'rxjs',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'react-use',
    ],
    allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000', '192.168.153.1:3000'],
  },
};

export default nextConfig;
