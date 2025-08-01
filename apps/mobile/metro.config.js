const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, '../../packages/firebase'),
  path.resolve(__dirname, '../../packages/schemas'),
  path.resolve(__dirname, '../../packages/state'),
  path.resolve(__dirname, '../../packages/forms'),
];

module.exports = config;