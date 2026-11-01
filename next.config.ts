import path from 'node:path';
import type { NextConfig } from 'next';

const stylesDir = path.join(process.cwd(), 'src/shared/styles');

const nextConfig: NextConfig = {
  sassOptions: {
    // Allows `@use 'mixins' as *;` in any SCSS module
    loadPaths: [stylesDir],
    includePaths: [stylesDir],
  },
  webpack: (config, { isServer }) => {
    // The MSW worker only exists in the browser; the server bundle ignores the module
    if (isServer) config.resolve.alias = { ...config.resolve.alias, 'msw/browser': false };
    return config;
  },
};

export default nextConfig;
