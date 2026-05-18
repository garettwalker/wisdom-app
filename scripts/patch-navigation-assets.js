#!/usr/bin/env node
/**
 * Patch @react-navigation/elements to move assets to a flatter path
 * Fixes ENOTDIR errors during iOS builds
 */

const fs = require('fs');
const path = require('path');

const elementsPath = path.join(__dirname, '..', 'node_modules', '@react-navigation', 'elements');
const sourceAssetsDir = path.join(elementsPath, 'lib', 'module', 'assets');
const targetAssetsDir = path.join(elementsPath, 'assets');

if (!fs.existsSync(sourceAssetsDir)) {
  console.log('Navigation elements assets not found, skipping patch');
  process.exit(0);
}

// Create target directory
if (!fs.existsSync(targetAssetsDir)) {
  fs.mkdirSync(targetAssetsDir, { recursive: true });
}

// Move all assets to flatter path
const assets = fs.readdirSync(sourceAssetsDir);
assets.forEach(asset => {
  const sourcePath = path.join(sourceAssetsDir, asset);
  const targetPath = path.join(targetAssetsDir, asset);

  if (fs.statSync(sourcePath).isFile()) {
    fs.copyFileSync(sourcePath, targetPath);
  }
});

console.log(`Patched ${assets.length} navigation assets to flatter path`);

// Now patch the source files to use the new path
const viewsDir = path.join(elementsPath, 'lib', 'module');
const filesToPatch = fs.readdirSync(viewsDir)
  .filter(f => f.endsWith('.js'))
  .map(f => path.join(viewsDir, f));

filesToPatch.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace relative asset imports
  content = content.replace(
    /require\(['"]\.\/assets\//g,
    "require('../../assets/"
  );
  fs.writeFileSync(filePath, content);
});

console.log(`Patched ${filesToPatch.length} source files`);
