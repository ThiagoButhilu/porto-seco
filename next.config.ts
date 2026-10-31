import path from 'node:path';
import type { NextConfig } from 'next';

const stylesDir = path.join(process.cwd(), 'src/shared/styles');

const nextConfig: NextConfig = {
  sassOptions: {
    // Permite `@use 'mixins' as *;` em qualquer módulo SCSS
    loadPaths: [stylesDir],
    includePaths: [stylesDir],
  },
  webpack: (config, { isServer }) => {
    // O worker do MSW só existe no browser; no bundle de servidor o módulo é ignorado
    if (isServer) config.resolve.alias = { ...config.resolve.alias, 'msw/browser': false };
    return config;
  },
};

export default nextConfig;
