const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only block specific problematic assets that cause ENOTDIR errors
// Allow expo-router and other needed node_modules assets
config.resolver.blockList = [
  // Block @react-navigation/elements assets specifically (deep paths cause issues)
  /.*\/node_modules\/.*\/lib\/module\/assets\/.*$/,
  /.*\/node_modules\/.*\/lib\/.*\/assets\/.*$/,
];

module.exports = config;
