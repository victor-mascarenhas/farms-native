import type { NextConfig } from "next";
const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    const { isServer } = options || {};
    config.plugins.push(
      new NextFederationPlugin({
        name: "host",
        filename: "static/chunks/remoteEntry.js",
        remotes: {
          remote: "remote@http://localhost:3001/remoteEntry.js",
        },
        shared: {},
      })
    );
    return config;
  },
};

export default nextConfig;
