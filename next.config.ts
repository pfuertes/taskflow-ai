const nextConfig = {
  serverExternalPackages: ['voyageai'],
  webpack: (config: { resolve: { alias: Record<string, string> } }) => {
    config.resolve.alias['voyageai'] = require.resolve('voyageai/dist/cjs/extended/index.js');
    return config;
  },
};

export default nextConfig;
