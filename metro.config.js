const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix ENOTDIR errors by blocking Metro from bundling assets in node_modules
// These assets should be handled by native build tools, not Metro
config.resolver.blockList = [
  // Block all asset files in node_modules from being bundled by Metro
  /.*\/node_modules\/.*\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|mp3|mp4|mov|m4v|wav|aac)$/i,
];

module.exports = config;
