const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block Metro from bundling Google Fonts - they are handled by expo-font at build time
config.resolver.blockList = [
  /.*\/node_modules\/.*\/.*\.ttf$/,
  /.*\/node_modules\/.*\/.*\.otf$/,
  /.*\/node_modules\/.*\/.*\.woff$/,
  /.*\/node_modules\/.*\/.*\.woff2$/,
];

// Ensure asset extensions don't include fonts handled by expo-font
config.resolver.assetExts = config.resolver.assetExts.filter(
  ext => ext !== 'ttf' && ext !== 'otf' && ext !== 'woff' && ext !== 'woff2'
);

module.exports = config;
