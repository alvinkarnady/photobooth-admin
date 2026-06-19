import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'puwfwhcrnprfnyqevlbf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-39bcbb6191eb4a958c8210dc87371845.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
