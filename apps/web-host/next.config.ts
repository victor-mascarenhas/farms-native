import type { NextConfig } from "next";
import { ModuleFederationPlugin } from "webpack".container;

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new ModuleFederationPlugin({
        name: "host",
        remotes: {
          remote: "remote@http://localhost:3001/remoteEntry.js",
        },
        shared: { react: { singleton: true }, "react-dom": { singleton: true } },
      })
    );
    return config;
  },
};

export default nextConfig;
