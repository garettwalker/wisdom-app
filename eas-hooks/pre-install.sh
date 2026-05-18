#!/bin/bash
# EAS pre-install hook - patches run after npm install but before build

set -e

echo "Running navigation asset patch..."

ELEMENTS_DIR="node_modules/@react-navigation/elements"

if [ -d "$ELEMENTS_DIR" ]; then
  # Create flatter assets dir
  mkdir -p "$ELEMENTS_DIR/assets"
  
  # Copy assets if source exists
  if [ -d "$ELEMENTS_DIR/lib/module/assets" ]; then
    cp -r "$ELEMENTS_DIR/lib/module/assets/"* "$ELEMENTS_DIR/assets/" 2>/dev/null || true
  fi
  
  # Patch JS imports
  find "$ELEMENTS_DIR/lib/module" -name "*.js" -exec sed -i '' "s|from './assets/|from '../../assets/|g" {} \; 2>/dev/null || true
  
  echo "Navigation assets patched successfully"
fi
