const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  "@": __dirname,
};

module.exports = config;
