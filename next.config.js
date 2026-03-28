/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configure the HMR client to use the correct WSS protocol and path
      // This overrides the automatic URL detection that is failing.
      config.devServer = {
        ...config.devServer,
        client: {
          webSocketURL:
            "wss://codespaces.franklin.eng.br/proxy/3000/_next/webpack-hmr",
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;

// next.config.js
module.exports = {
  // This ensures assets are loaded from the correct proxied subpath
  assetPrefix: process.env.NODE_ENV === "development" ? "/proxy/3000" : "",
};
